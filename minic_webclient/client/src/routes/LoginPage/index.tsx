import { Component } from 'react';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import LoginAlert from '../../components/LoginAlert';

import './index.css';

class Login extends Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            status: "",
            countdown: 0,
            buttonDisable: false,
            message: "",
            resend: false,
			resendDisable: true,
			username: "",
            unactivated: false,
            errorMessage: ""
        };
    }

    resetCountdown = () => {
		const countdown = setInterval(() => {
			this.setState({ countdown: this.state.countdown - 1 });
			if (this.state.countdown <= 0) {
				this.setState({ resendDisable: false });
				clearInterval(countdown);
			}
		}, 1000);
	}

    handleResendButtonOnClick = () => {
        fetch("/auth/activation", 
            {
                method: "POST",
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: this.state.username })
            })
            .then(res => {
				if (res.status === 200) {
					this.setState({
						resendDisable: true,
						countdown: 60,
                        message: this.state.errorMessage + " You can request to re-send your the activation email in $countdown seconds."
					}, this.resetCountdown
					);
				}
				return res.text();
			})
            .then(res => res)
            .catch(err => err);
    }

    handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const username = data.get('username');
        const password = data.get('password');
        fetch("/auth/login", 
            {
                method: "POST",
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: username, password: password })
            })
            .then(res => {
                if (res.status === 200) {
                    this.setState({
                        status: "success",
                        countdown: 10,
                        buttonDisable: true,
                        message: "You have successfully logged in. Redirecting in $countdown seconds."
                    }, () => {
                        const countdown = setInterval(() => {
                            this.setState({ countdown: this.state.countdown - 1 });
                            if (this.state.countdown <= 0) {
                                clearInterval(countdown);
                                window.location.href = "/";
                            }
                        }, 1000);
                    });
                    return res.json()
                } else if (res.status === 409){
                    this.setState({
                        status: "fail",
                        countdown: 60,
                        resend: true,
                        resendDisable: false,
                        unactivated: true,
                        username: username
                    });
                    return res.text()
                } else {
                    this.setState({
                        status: "fail",
                        unactivated: false,
                        resend: false,
                        resendDisable: true
                    });
                    return res.text()
                }
            })
            .then(data => {
                if (this.state.status === "fail") {
                    this.setState({
                        errorMessage: data,
                        message: this.state.unactivated ? data + " Would you like to re-send an activation email to your email address?" : data
                    })
                }
            })
            .catch(err => err);
    };

    render() {
        return (
            <ThemeProvider theme={createTheme()}>
                <Grid container component="main" sx={{ height: '100vh' }}>
                    <CssBaseline />
                    <Grid
                        item
                        xs={false}
                        sm={4}
                        md={7}
                        sx={{
                            backgroundImage: 'url(https://source.unsplash.com/random)',
                            backgroundRepeat: 'no-repeat',
                            backgroundColor: (t) =>
                            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    />
                    <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                        <Box
                            sx={{
                            my: 8,
                            mx: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            }}
                        >
                            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                                <LockOutlinedIcon />
                            </Avatar>
                            <Typography component="h1" variant="h5">
                            Sign in
                            </Typography>
                            <Box component="form" noValidate onSubmit={this.handleSubmit} sx={{ mt: 1 }}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="username"
                                    label="Username"
                                    name="username"
                                    autoComplete="username"
                                    autoFocus
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    id="password"
                                    autoComplete="current-password"
                                />
                                <FormControlLabel
                                    control={<Checkbox value="remember" color="primary" />}
                                    label="Remember me"
                                />
                                <Button
                                    disabled={this.state.buttonDisable}
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{ mt: 3, mb: 2 }}
                                >
                                Sign In
                                </Button>
                                <Grid container>
                                    <Grid item xs>
                                    <Link href="#" variant="body2">
                                        Forgot password?
                                    </Link>
                                    </Grid>
                                    <Grid item>
                                    <Link href="/signup" variant="body2">
                                        {"Don't have an account? Sign Up"}
                                    </Link>
                                    </Grid>
                                </Grid>
                                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 5 }}>
                                    {'Copyright © '}
                                    <Link color="inherit" href="https://mui.com/">
                                    Your Website
                                    </Link>{' '}
                                    {new Date().getFullYear()}
                                    {'.'}
                                </Typography>
                            </Box>
                            <LoginAlert
                                    status={this.state.status}
                                    message={this.state.message}
                                    countdown={this.state.countdown}
						            resend={this.state.resend}
						            resendDisable={this.state.resendDisable}
						            handleResendButtonOnClick={this.handleResendButtonOnClick}
                                />
                        </Box>
                    </Grid>
                </Grid>
            </ThemeProvider>
          );
    }
}

export default Login;