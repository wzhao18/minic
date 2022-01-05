import { Component } from 'react';
import { InputLabel, MenuItem, FormControl, Select } from '@mui/material';
import './index.css'

class OptLevelDropdown extends Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <FormControl sx={{ m: 1, minWidth: 120 }}>
                <InputLabel>Opt Level</InputLabel>
                <Select
                    value={this.props.optLevel}
                    onChange={this.props.handleOptLevelDropDownChange}
                >
                {this.props.optLevels.map(
                    (level: any) => (<MenuItem key={level} value={level}>
                                    {level} 
                                </MenuItem>)
                )}
                </Select>
            </FormControl>
        )
    }
}

export default OptLevelDropdown;