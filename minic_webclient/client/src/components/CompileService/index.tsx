import { Component } from 'react';

import { Button, Slider } from '@mui/material';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import HeightIcon from '@mui/icons-material/Height';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import IconButton from '@mui/material/IconButton';

import MonacoEditor from '../MonacoEditor';
import LanguageDropdown from '../LanguageDropdown';
import EditorThemeDropdown from '../EditorThemeDropdown';
import OptLevelDropdown from '../OptLevelDropdown';

import './index.css'

class CompileService extends Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            displayCode: "",
            result: "result will be here",
            editorFontSize: 17,
            language: "minic",
            theme: "vs-dark",
            operation: "",
            editorHeight: 70,
            uploadedFile: null,
            optLevel: 0
        };
    }

    componentDidMount() {
        this.fetchSampleCode()
    }

    fetchSampleCode = () => {
        fetch("/sample/" + this.state.language,
            {
                method: "GET",
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(res => res.text())
            .then(res => {
                this.setState({ displayCode: res });
            })
            .catch(err => err);
    }

    themeOptions = ["vs", "vs-dark", "hc-black"];
    optLevels = [0, 1, 2, 3];
    languageOptions : any = {
        minic: {
            userFriendly: 'MiniC',
            editor: 'c'
        },
        c: {
            userFriendly: 'C',
            editor: 'c'
        },
        cpp: {
            userFriendly: 'C++',
            editor: 'cpp'
        }
    };

    handleCodeEditorChange = (value: any, event: any) => {
        this.props.setCode(value);
    }

    sendCompileExecuteRequest = () => {
        const endpoint = `/service?operation=${this.state.operation}`;
        fetch(endpoint,
        {
            method: "POST",
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "code": this.props.code != null ? this.props.code : this.state.displayCode,
                "language": this.state.language,
                "optLevel": this.state.optLevel
            })
        })
        .then(res => res.text())
        .then(res => {
            this.setState({ result: res });
            this.props.fetchFileTree();
        })
        .catch(err => err);
    }

    hanldeCompileButtonOnClick = (e: any) => {
        this.setState({ operation: "compile" }, this.sendCompileExecuteRequest);
    }

    hanldeExecuteButtonOnClick = (e: any) => {
        this.setState({ operation: "execute" }, this.sendCompileExecuteRequest);
    }

    setLanguage = (value: any) => {
        this.setState({ language: value }, this.fetchSampleCode);
    }

    handleThemeDropDownChange = (e: any) => {
        this.setState({ theme: e.target.value });
    }

    handleOptLevelDropDownChange = (e: any) => {
        this.setState({ optLevel: e.target.value });
    }

    handleEditorFontSizeSlider = (e: any) => {
        this.setState({ editorFontSize: e.target.value });
    }

    handleEditorHeightSlider = (e: any) => {
        this.setState({ editorHeight: e.target.value });
    }

    handleUploadButtonOnClick = (e: any) => {
        this.setState({ uploadedFile: e.target.files[0] }, () => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event: any) => {
                this.props.setCode(event.target.result)
            };
            reader.readAsText(file);
        });
    }

    getSelectedFileName = (maxLength = 20) => {
        if (!this.state.uploadedFile) {
            return "";
        }
        
        const file_name = this.state.uploadedFile.name;
        if (file_name.length < maxLength) {
            return file_name;
        } else {
            return file_name.substring(0, maxLength) + "...";
        }
    }

    handleSaveCodeButtonOnClick = (e: any) => {
        fetch(`/code/fs${this.props.selectFilePath}`,
            {
                method: "PATCH",
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "code": this.props.code})
            })
            .then(res => res.text())
            .then(res => {
                this.setState({ result: res });
                this.props.fetchFileTree();
            })
            .catch(err => err);
    }

    render() {
        return (
            <div>
                <div style={{width: "100%", display: "flex", alignItems: "center", marginTop: "3%", marginLeft: "1%"}}>
                    <LanguageDropdown
                        language={this.state.language}
                        setLanguage={this.setLanguage}
                        languageOptions={this.languageOptions}
                    />
                    <EditorThemeDropdown
                        theme={this.state.theme}
                        handleThemeDropDownChange={this.handleThemeDropDownChange}
                        themeOptions={this.themeOptions}
                    />
                    <OptLevelDropdown
                        optLevel={this.state.optLevel}
                        optLevels={this.optLevels}
                        handleOptLevelDropDownChange={this.handleOptLevelDropDownChange}
                    />
                    <FormatSizeIcon fontSize="large" sx={{ m: 1 }} />
                    <Slider 
                        style={{ width: "7%"}}
                        min={10}
                        max={30}
                        value={this.state.editorFontSize}
                        onChange={this.handleEditorFontSizeSlider}
                    />
                    <HeightIcon fontSize="large" sx={{ m: 1 }}/>
                    <Slider 
                        style={{ width: "7%"}}
                        min={50}
                        max={100}
                        value={this.state.editorHeight}
                        onChange={this.handleEditorHeightSlider}
                    />

                    <IconButton sx={{ ml: 3 }} size="medium" component="label" onChange={this.handleUploadButtonOnClick}>
                        <UploadIcon color="primary" fontSize="large"/>
                        <input type="file" hidden />
                    </IconButton>
                    <strong> {this.getSelectedFileName()} </strong>
                    <IconButton sx={{ mr: 2 }} size="medium">
                        <DownloadIcon color="primary" fontSize="large"/>
                    </IconButton>
                    <Button sx={{ m: 1 }} variant="contained" onClick={this.handleSaveCodeButtonOnClick}> Save </Button>
                    <Button sx={{ m: 1 }} variant="contained" onClick={this.hanldeCompileButtonOnClick}> Compile </Button>
                    <Button sx={{ m: 1 }} variant="contained" onClick={this.hanldeExecuteButtonOnClick}> Execute </Button>
                </div>
                
                <div style={{margin: "1% 0.2% 1% 1%", height: this.state.editorHeight + "vh", width: "48.8%", float: "left"}}>
                    <MonacoEditor
                        code={this.props.code != null ? this.props.code : this.state.displayCode}
                        language={this.languageOptions[this.state.language].editor}
                        handleEditorChange={this.handleCodeEditorChange}
                        options={{ fontSize: this.state.editorFontSize }}
                        theme={this.state.theme}
                    />
                </div>
                <div style={{margin: "1% 1% 1% 0.2%", height: this.state.editorHeight + "vh", width: "48.8%", float: "left"}}>
                    <MonacoEditor
                        code={this.state.result}
                        language="plaintext"
                        options={{ readOnly: true, fontSize: this.state.editorFontSize }}
                        theme={this.state.theme}
                    />
                </div>
            </div>
        );
    }
}

export default CompileService;