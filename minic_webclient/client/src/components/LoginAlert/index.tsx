import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';

import './index.css';

function LoginAlert(props: any) {
    if (props.status === "success") {
        return <Alert sx={{mt: 2, width: "100%"}} severity="success">
                    <AlertTitle>Success</AlertTitle>
                    <strong>{props.message.replace("$countdown", props.countdown)}</strong>
                    {props.resend ?
                    <Button 
                        disabled={props.resendDisable}
                        onClick={props.handleResendButtonOnClick}
                    >
                    Re-send 
                    </Button> : null}
                </Alert>;
    } else if (props.status === "fail") {
        return <Alert sx={{mt: 2, width: "100%"}} severity="error">
                    <AlertTitle><strong>Error</strong></AlertTitle>
                    <strong>{props.message.replace("$countdown", props.countdown)}</strong>
                    {props.resend ?
                    <Button 
                        disabled={props.resendDisable}
                        onClick={props.handleResendButtonOnClick}
                    >
                    Re-send 
                    </Button> : null}
                </Alert>;
    }
    return null;
}

export default LoginAlert;