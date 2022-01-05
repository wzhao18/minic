import * as React from 'react';

import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import TextField from '@mui/material/TextField';

import FileBrowserFile from '../FileBrowserFile'

export default function FileBrowserFolder(props: any) {
    const [rename, setRename] = React.useState(false);
    const [newName, setNewName] = React.useState("");
    const [openFolder, setFolderOpen] = React.useState(false);
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

    const handleTextFieldOnChange = (event: any) => {
        setNewName(event.target.value);
    }

    const toggleRename = () => {
        setRename(!rename);
    }

    const handleAddButton = (e: any) => {
        setAnchorElUser(e.currentTarget);
    }

    const handleAddMenuButton = (e: any) => {
        handleCloseUserMenu();
        const option = e.currentTarget.textContent;
        createNewFileOrFolder(option)
    }

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleFolderOpen = () => {
        setFolderOpen(!openFolder);
    };

    const handleDeleteButton = (e: any) => {
        e.stopPropagation();
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

    const findAvailableName = (type: string) => {
        let counter = 1;
        let newName = ""
        const base = type === "file" ? "Untitled" : "Untitled-Folder"
        const findSameName = (e: any, name: string) => {
            return e.name === name
        }
        while (counter < 1000) {
            let found = false;
            newName = `${base}-${counter}`
            for (let i = 0; i < props.folder.items.length; i++) {
                const item = props.folder.items[i];
                if (findSameName(item, newName)) {
                    found = true;
                }
            }
            if (!found) {
                break;
            }
            counter += 1
        }
        return newName
    }

    const createNewFileOrFolder = (type: string) => {
        const newName = findAvailableName(type);
        fetch(`/code?type=${type}`,
            {
                method: "POST",
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ path: `${props.path === "/" ? "" : props.path}/${newName}`, code: "# Empty File" }),
            })
            .then(res => res.text())
            .then(res => props.fetchFileTree())
            .catch(err => err);
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

    const renderFolderItems = () => {
        return props.folder.items.map((item: any) => {
            if (item.id) {
                return (
                    <FileBrowserFile
                        key={`${props.path === "/" ? "" : props.path}/${item.name}`}
                        path={`${props.path === "/" ? "" : props.path}/${item.name}`}
                        indent={props.indent + 1}
                        fileName={item.name}
                        edit={props.edit}
                        fetchFileTree={props.fetchFileTree}
                        handleSelectFile={props.handleSelectFile}
                    />
                )
            } else {
                return (
                    <FileBrowserFolder
                        key={`${props.path === "/" ? "" : props.path}/${item.name}`}
                        path={`${props.path === "/" ? "" : props.path}/${item.name}`}
                        indent={props.indent + 1}
                        folder={item}
                        edit={props.edit}
                        fetchFileTree={props.fetchFileTree}
                        handleSelectFile={props.handleSelectFile}
                    />
                )
            }
        });
    }

    return (
        <>
            <ListItem 
                secondaryAction={
                    <>
                        {props.edit && rename ? 
                            <TextField
                                onChange={handleTextFieldOnChange}
                                sx={{ marginLeft: 0 }}
                                hiddenLabel
                                size="small"
                                defaultValue={props.folder.name}
                            /> : null
                        }
                        {props.edit && !rename && props.path !== "/" && props.path !== "/history" ?
                            (<IconButton onClick={toggleRename} edge="end" aria-label="rename">
                                <EditIcon />
                            </IconButton>) : null
                        }
                        {props.edit && rename ?
                            (<IconButton onClick={handleSaveButtonOnClick} edge="end" aria-label="save">
                                <SaveIcon />
                            </IconButton>) : null
                        }
                        {props.edit ? null : (openFolder ? <ExpandLess /> : <ExpandMore />)}
                        {props.edit ?
                            (<IconButton onClick={handleAddButton} edge="end" aria-label="delete">
                                <AddIcon/>
                            </IconButton>) : null
                        }
                        {(props.edit && props.path !== "/" && props.path !== "/history") ?
                            (<IconButton onClick={handleDeleteButton} edge="end" aria-label="delete">
                                <DeleteIcon />
                            </IconButton>) : null
                        }
                        <Menu
                            sx={{ mt: '45px' }}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                            >
                            {['file', 'folder'].map((setting) => (
                                <MenuItem key={setting} onClick={handleAddMenuButton}>
                                    <Typography textAlign="center">{setting}</Typography>
                                </MenuItem>
                            ))}
                    </Menu>
                    </>
                }
                disablePadding
            >
                <ListItemButton 
                    sx={{ pl: props.indent === 0 ? 0.5 : props.indent * 1 }} 
                    onClick={handleFolderOpen}
                >
                    <ListItemIcon>
                        <FolderIcon color="primary"/>
                    </ListItemIcon>
                    {!rename ? <ListItemText primary={props.folder.name} /> : null}
                </ListItemButton>
            </ListItem>
            <Collapse in={openFolder} timeout="auto" unmountOnExit>
                <List dense={true} component="div" disablePadding>
                    {renderFolderItems()}
                </List>
            </Collapse>
        </>
    );
}