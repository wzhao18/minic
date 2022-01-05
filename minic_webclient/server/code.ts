import { Router } from 'express';
import axios from 'axios';

import { axios_error_handler } from './err'
import { MINIC_SERVER_HOST, MINIC_SERVER_PORT } from './config'

const router = Router();

router.get("/", (req, res) => {
    if (!req.session.user) {
        res.status(403).send("Please sign in to use the service.");
        return;
    }
    axios.get(`http://${MINIC_SERVER_HOST}:${MINIC_SERVER_PORT}/code`, {
        auth: {
            username: req.session.user.username,
            password: req.session.user.password,
        }  
    })
    .then(response => res.status(response.status).send(response.data))
    .catch(axios_error_handler(res));
});

router.post("/", (req, res) => {
    if (!req.session.user) {
        res.status(403).send("Please sign in to use the service.");
        return;
    }
    axios.post(`http://${MINIC_SERVER_HOST}:${MINIC_SERVER_PORT}/code`, req.body, {
        params: {
            type: req.query.type
        },
        auth: {
            username: req.session.user.username,
            password: req.session.user.password,
        }  
    })
    .then(response => res.status(response.status).send(response.data))
    .catch(axios_error_handler(res));
});

router.delete("/", (req, res) => {
    if (!req.session.user) {
        res.status(403).send("Please sign in to use the service.");
        return;
    }
    axios.delete(`http://${MINIC_SERVER_HOST}:${MINIC_SERVER_PORT}/code`, {
        auth: {
            username: req.session.user.username,
            password: req.session.user.password,
        },
        data: req.body
    })
    .then(response => res.status(response.status).send(response.data))
    .catch(axios_error_handler(res));
});

router.get("/fs/*", (req, res) => {
    if (!req.session.user) {
        res.status(403).send("Please sign in to use the service.");
        return;
    }
    const path = req.params[0]
    axios.get(`http://${MINIC_SERVER_HOST}:${MINIC_SERVER_PORT}/code/fs/${path}`, {
        auth: {
            username: req.session.user.username,
            password: req.session.user.password,
        }
    })
    .then(response => res.status(response.status).send(response.data))
    .catch(axios_error_handler(res));
});

router.patch("/fs/*", (req, res) => {
    if (!req.session.user) {
        res.status(403).send("Please sign in to use the service.");
        return;
    }
    const path = req.params[0]
    axios.patch(`http://${MINIC_SERVER_HOST}:${MINIC_SERVER_PORT}/code/fs/${path}`, req.body, {
        auth: {
            username: req.session.user.username,
            password: req.session.user.password,
        }
    })
    .then(response => res.status(response.status).send(response.data))
    .catch(axios_error_handler(res));
});

module.exports = router;
