import fs from 'fs';
import path from 'path';
import { Router } from 'express';

const router = Router();

const supportLanguageExtensions = ["c", "cpp", "minic"]


router.get("/:language", (req, res) => {
    const languageExtension = req.params.language
    if (!supportLanguageExtensions.includes(languageExtension)) {
        res.status(400).send("Language not supported!")
    }
    const language_folder = path.join(__dirname, "../code_samples", languageExtension)
    const file_names = fs.readdirSync(language_folder);
    const random_file = file_names[Math.floor(Math.random() * file_names.length)];
    const random_file_path = path.join(language_folder, random_file)
    fs.readFile(random_file_path, 'utf8', function(err, data) {
        if (err) { 
            throw err; 
        }
        res.status(200).send(data);
    });
});

module.exports = router;
