import { Component } from 'react';
import { InputLabel, MenuItem, FormControl, Select } from '@mui/material';
import './index.css'

class LanguageDropdown extends Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {};
    }

    handleSelectOnChange = (e: any) => {
        this.props.setLanguage(e.target.value)
    }

    render() {
        return (
                <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <InputLabel>Language</InputLabel>
                    <Select
                        value={this.props.language}
                        onChange={this.handleSelectOnChange}
                    >
                    {Object.keys(this.props.languageOptions).map(
                        (language: any) => (<MenuItem key={language} value={language}>
                                        {this.props.languageOptions[language].userFriendly} 
                                    </MenuItem>)
                    )}
                    </Select>
                </FormControl>
        )
    }
}

export default LanguageDropdown;