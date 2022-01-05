import { Component } from 'react';
import { InputLabel, MenuItem, FormControl, Select } from '@mui/material';
import './index.css'

class EditorThemeDropdown extends Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <FormControl sx={{ m: 1, minWidth: 120 }}>
                <InputLabel>Editor Theme</InputLabel>
                <Select
                    value={this.props.theme}
                    onChange={this.props.handleThemeDropDownChange}
                >
                {this.props.themeOptions.map(
                    (theme: any) => (<MenuItem key={theme} value={theme}>
                                    {theme} 
                                </MenuItem>)
                )}
                </Select>
            </FormControl>
        )
    }
}

export default EditorThemeDropdown;