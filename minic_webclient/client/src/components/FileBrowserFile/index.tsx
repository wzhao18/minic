import * as React from 'react';

import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import TextField from '@mui/material/TextField';

export default function FileBrowserFile(props: any) {
    const [rename, setRename] = React.useState(false);
    const [newName, setNewName] = React.useState("");

    const toggleRename = () => {
        setRename(!rename);
    }

    const handleSaveButtonOnClick = (event: any) => {
        toggleRename();
        fetch(`/code/fs${props.path}`,
            {
                method: "PATCH",
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ newName: newName }),

            })
            .then(res => res.text())
            .then(res => props.fetchFileTree())
            .catch(err => err);
    }

    const handleDeleteButton = (e: any) => {
        fetch(`/code`,
            {
                method: "DELETE",
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ path: props.path }),
            })
            .then(res => res.text())
            .then(res => props.fetchFileTree())
            .catch(err => err);
    }

    const handleFileButtonOnClick = () => {
        props.handleSelectFile(props.path);
    }

    const handleTextFieldOnChange = (event: any) => {
        setNewName(event.target.value);
    }

    return (
        <ListItem
            secondaryAction={
                <>
                    {props.edit && !rename ?
                        (<IconButton onClick={toggleRename} edge="end" aria-label="rename">
                            <EditIcon />
                        </IconButton>) : null
                    }
                    {props.edit && rename ?
                        (<IconButton onClick={handleSaveButtonOnClick} edge="end" aria-label="save">
                            <SaveIcon />
                        </IconButton>) : null
                    }
                    {props.edit ?
                        (<IconButton onClick={handleDeleteButton} edge="end" aria-label="delete">
                            <DeleteIcon />
                        </IconButton>) : null
                    }
                </>
            }
            disablePadding
        >
            { !props.edit || !rename ? 
                <ListItemButton onClick={handleFileButtonOnClick} sx={{ pl: props.indent === 0 ? 0.5 : props.indent * 1 }}>
                    <ListItemIcon>
                        <InsertDriveFileIcon color="secondary"/>
                    </ListItemIcon>
                    <ListItemText primary={props.fileName} />
                </ListItemButton> : null
            }
            {props.edit && rename ?
                    <>
                    <ListItemIcon>
                        <InsertDriveFileIcon color="secondary"/>
                    </ListItemIcon>
                    <TextField
                        onChange={handleTextFieldOnChange}
                        hiddenLabel
                        size="small"
                        defaultValue={props.fileName}
                    />
                    </> : null
            }

        </ListItem>
    );
}