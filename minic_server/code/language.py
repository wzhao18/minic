LANGUAGES = {
    "C": {"ext": "c"},
    "C++": {"ext": "cpp"},
    "Cpp": {"ext": "cpp"},
    "MiniC": {"ext": "minic"}
}

def get_language_extension(language):
    for lan in LANGUAGES:
        if lan.lower() == language.lower():
            return LANGUAGES[lan]["ext"]
    return None