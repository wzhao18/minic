import { Router } from 'express';
import axios from 'axios';

import { axios_error_handler } from './err'
import { MINIC_SERVER_HOST, MINIC_SERVER_PORT } from './config'

const router = Router();

router.post("/login", (req, res) => {
    const username = req.body.username
    const password = req.body.password
    axios.get(`http://${MINIC_SERVER_HOST}:${MINIC_SERVER_PORT}/auth/login`, {
        auth: {
            username: username,
            password: password
        }
    })
    .then(response => {
        req.session.user = { username: username, password: password };
        req.session.save();
        res.status(response.status).send(response.data);
    })
    .catch(axios_error_handler(res));
});

router.post("/register", (req, res) => {
    axios.post(`http://${MINIC_SERVER_HOST}:${MINIC_SERVER_PORT}/auth/register`, req.body)
        .then(response => res.status(response.status).send(response.data))
        .catch(axios_error_handler(res))
});

router.post("/activation", (req, res) => {
    axios.post(`http://${MINIC_SERVER_HOST}:${MINIC_SERVER_PORT}/auth/activation`, req.body)
        .then(response => res.status(response.status).send(response.data))
        .catch(axios_error_handler(res))
});

router.get('/user', (req, res) => {
    let username = "";
    try {
        username = req.session.user.username;
    } catch (err) {}
     res.status(200).send({ username: username });
});

router.get('/logout', (req, res) => {
	req.session.destroy((error) => {
		if (error) {
			res.status(500).send(error);
		} else {
			res.status(200).send("ok");
		}
	})
})

module.exports = router;
