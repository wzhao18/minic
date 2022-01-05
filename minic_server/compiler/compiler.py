import subprocess, select, os, time, signal
from typing import Tuple

from minic_server.config.config import *
from minic_server.code.code_mgmt import CodeManager
from minic_server.code.language import get_language_extension

class Compiler:
    @classmethod
    def initialize(cls):
        pass

    @classmethod
    def get_compiler(cls, language):
        language = language.lower()
        if language == "c":
            compiler = C_COMPILER
        elif language in ["cpp", "c++"]:
            compiler = CXX_COMPILER
        elif language == "minic":
            compiler = MINIC_COMPILER
        else:
            compiler = None
        return compiler

    @classmethod
    def save_code_to_fs(cls, file_name, code):
        with open(file_name, 'w+') as file:
            file.write(code)
        return True

    @classmethod
    def execute_command(cls, cmd, timeout = 20):
        process = subprocess.Popen(cmd, stdout = subprocess.PIPE, stderr = subprocess.STDOUT, shell=True, \
                                   universal_newlines=True, preexec_fn=os.setsid)
        output = ""
        dataend = False
        start_time = time.time()
        while (process.returncode is None) or (not dataend):
            process.poll()
            dataend = False

            ready = select.select([process.stdout], [], [], 1.0)
            if process.stdout in ready[0]:
                data = process.stdout.read(1024)
                if len(data) == 0:
                    dataend = True
                else:
                    output += data

            curr_time = time.time()
            if curr_time - start_time >= timeout:
                os.killpg(os.getpgid(process.pid), signal.SIGKILL)
                process.wait()
                if output != "" and output[-1] != "\n":
                    output += "\n"
                output += f"Aborted due to timeout - {timeout} seconds"
                return output, process.returncode

        return output, process.returncode

    @classmethod
    def compile_to_llvm_ir(cls, file_name, language, optLevel) -> Tuple[str, bool]:
        name = file_name.rsplit('.', 1)[0]
        compiler = cls.get_compiler(language)
        if not compiler:
            os.remove(file_name)
            return f"Language {language} is not supported for compiling into llvm ir", False
        ir_file_name = name + '.ll'

        if compiler in [C_COMPILER, CXX_COMPILER]:
            command = f"{compiler} -O{optLevel} -S -emit-llvm {file_name} -o {ir_file_name}"
        elif compiler in [MINIC_COMPILER]:
            command = f"{compiler} -O{optLevel} -emit-ir {file_name} -o {ir_file_name}"

        output, return_code = cls.execute_command(command)

        success = False
        if os.path.isfile(ir_file_name):
            with open(ir_file_name, 'r') as ir_file:
                output = ir_file.read()
                success = True
        
        for file in [file_name, ir_file_name]:
            if os.path.isfile(file):
                os.remove(file)

        return output, success

    @classmethod
    def run_program(cls, file_name, language, optLevel) -> Tuple[str, bool]:
        compiler = cls.get_compiler(language)
        if not compiler:
            os.remove(file_name)
            return f"Language {language} is not supported for running", False
        executable_file_name = file_name.rsplit('.', 1)[0]
        bitcode_file_name = executable_file_name + '.bc'

        commands = []
        if compiler in [C_COMPILER, CXX_COMPILER]:
            commands.append(f"{compiler} -O{optLevel} {file_name} -o {executable_file_name}")
        elif compiler in [MINIC_COMPILER]:
            commands.append(f"{compiler} -O{optLevel} {file_name} -o {bitcode_file_name}")
            commands.append(f"{C_COMPILER} {bitcode_file_name} -l{MINIC_IO_LIB} -o {executable_file_name}")
        commands.append(f"./{executable_file_name}")

        success = True
        for i in range(len(commands)):
            command = commands[i]
            output, return_code = cls.execute_command(command)
            if return_code != 0 and i != len(commands) - 1:
                success = False
                break

        for file in [file_name, bitcode_file_name, executable_file_name]:
            if os.path.isfile(file):
                os.remove(file)
    
        return output, success

    @classmethod
    def process_service_request(cls, operation, username, file_name, language, optLevel, code) -> Tuple[str, bool]:
        lan_ext = get_language_extension(language)
        if not lan_ext:
            return "Language is not supported", False
        if not file_name.endswith(lan_ext):
            file_name = f"{file_name}.{lan_ext}"

        CodeManager.save_code_for_user(username, f"/history/{file_name}", code)
        if not cls.save_code_to_fs(file_name, code):
            return "Same error happened", False

        if operation == "compile":
            return cls.compile_to_llvm_ir(file_name, language, optLevel)
        elif operation == "execute":
            return cls.run_program(file_name, language, optLevel)