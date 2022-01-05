import { Component } from 'react';

import { Button } from '@mui/material';

import './index.css';

class LoginMenu extends Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {};
    }

    handleLoginButtonOnClick = () => {
        window.location.href = "/login";
    }

    handleSignupButtonOnClick = () => {
        window.location.href = "/signup";
    }

    render() {
        return (
            <div>
                <Button sx={{ m:1 }} variant="contained" onClick={this.handleLoginButtonOnClick}> Log in </Button>
                <Button sx={{ m:1 }} variant="contained" onClick={this.handleSignupButtonOnClick}> Sign up </Button>
            </div>
        );
    }
}

export default LoginMenu;