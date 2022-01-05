import { Router } from 'express';
import axios from 'axios';

import { axios_error_handler } from './err'
import { MINIC_SERVER_HOST, MINIC_SERVER_PORT } from './config'

const router = Router();

router.post("/", (req, res) => {
    if (!req.session.user) {
        res.status(403).send("Please sign in to use the service.");
        return;
    }
    axios.post(`http://${MINIC_SERVER_HOST}:${MINIC_SERVER_PORT}/service`, req.body, {
        params: {
            operation: req.query.operation
        },
        auth: {
            username: req.session.user.username,
            password: req.session.user.password,
        }  
    })
    .then(response => res.status(response.status).send(response.data))
    .catch(axios_error_handler(res));
});


module.exports = router;
