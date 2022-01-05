export function axios_error_handler(res)
{
    return (err) => {
        if (err.response) {
            res.status(err.response.status).send(err.response.data)
        } else {
            res.status(400).send("Cannot establish connection with server.")
        }
    }
};
