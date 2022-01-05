import { Component } from 'react';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import LoginAlert from '../../components/LoginAlert';

import './index.css';

class Signup extends Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
			status: "",
			countdown: 0,
			buttonDisable: false,
			message: "",
			resend: false,
			resendDisable: true,
			username: ""
		};
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
						countdown: 60
					}, this.resetCountdown
					);
				}
				return res.text();
			})
            .then(res => res)
            .catch(err => err);
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

    handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
		const email = data.get('email');
        const username = data.get('username');
        const password = data.get('password');
        fetch("/auth/register", 
            {
                method: "POST",
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: username, password: password, email: email })
            })
            .then(res => {
				if (res.status === 200) {
                    this.setState({
						status: "success",
						countdown: 60,
						buttonDisable: true,
						resend: true,
						resendDisable: true,
						username: username,
						message: "You have successfully signed up. Please check your email inbox and activate " + 
								"your account by clicking the link attached. You can request to re-send the activation " +
								"email in $countdown seconds."
					}, this.resetCountdown
					);
					return res.json()
                } else {
					this.setState({ status: "fail" })
					return res.text()
				}
			})
			.then(data => {
				if (this.state.status === "fail") {
					this.setState({ message: data })
				}
			})
            .catch(err => err);
    };

    render() {
      	return (
        	<ThemeProvider theme={createTheme()}>
          		<Container component="main" maxWidth='xs'>
            		<CssBaseline />
					<Box
						sx={{
							marginTop: 8,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
						}}
					>
						<Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
							<LockOutlinedIcon />
						</Avatar>
						<Typography component="h1" variant="h5">
							Sign up
						</Typography>
						<Box component="form" noValidate onSubmit={this.handleSubmit} sx={{ mt: 3 }}>
							<Grid container spacing={2}>
								<Grid item xs={12} sm={6}>
									<TextField
										autoComplete="given-name"
										name="firstName"
										fullWidth
										id="firstName"
										label="First Name"
										autoFocus
									/>
								</Grid>
								<Grid item xs={12} sm={6}>
									<TextField
										fullWidth
										id="lastName"
										label="Last Name"
										name="lastName"
										autoComplete="family-name"
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										required
										fullWidth
										id="email"
										label="Email"
										name="email"
										autoComplete="email"
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										required
										fullWidth
										id="username"
										label="Username"
										name="username"
										autoComplete="username"
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										required
										fullWidth
										name="password"
										label="Password"
										type="password"
										id="password"
										autoComplete="new-password"
									/>
								</Grid>
								<Grid item xs={12}>
									<FormControlLabel
										control={<Checkbox value="allowExtraEmails" color="primary" />}
										label="I want to receive inspiration, marketing promotions and updates via email."
									/>
								</Grid>
							</Grid>
							<Button
								disabled={this.state.buttonDisable}
								type="submit"
								fullWidth
								variant="contained"
								sx={{ mt: 3, mb: 2 }}
							>
							Sign Up
							</Button>
							<Grid container justifyContent="flex-end">
								<Grid item>
									<Link href="/login" variant="body2">
									Already have an account? Sign in
									</Link>
								</Grid>
							</Grid>
						</Box>
					</Box>
					<Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 5 }} >
						{'Copyright © '}
						<Link color="inherit" href="https://mui.com/">
							Your Website
						</Link>{' '}
						{new Date().getFullYear()}
						{'.'}
					</Typography>
					<LoginAlert
						status={this.state.status}
						message={this.state.message}
						resend={this.state.resend}
						resendDisable={this.state.resendDisable}
						countdown={this.state.countdown}
						handleResendButtonOnClick={this.handleResendButtonOnClick}
					/>
          		</Container>
        	</ThemeProvider>
      	);
    }
}

export default Signup;