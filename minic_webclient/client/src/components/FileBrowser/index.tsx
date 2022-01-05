import React, { useState, useLayoutEffect } from 'react';

import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';

import FileBrowserFolder from '../FileBrowserFolder';

export default function FileBrowser(props: any) {

    const [edit, setEdit] = useState(false);
    const { fetchFileTree } = props;

    const toggleEdit = () => {
        setEdit(!edit);
    }
    
    useLayoutEffect(() => {
        fetchFileTree()
    }, [fetchFileTree])

    return (
        <List
            dense={true}
            sx={{ width: '100%', bgcolor: 'background.paper', marginTop: "7%" }}
            component="nav"
            aria-labelledby="nested-list-subheader"
            subheader={
                <ListSubheader component="div" id="nested-list-subheader">
                    Files
                    <IconButton onClick={toggleEdit} aria-label="delete">
                        <EditIcon />
                    </IconButton>
                </ListSubheader>
            }
        >
            {props.fileTree ? 
                <FileBrowserFolder
                    key="root"
                    indent={0}
                    folder={props.fileTree}
                    path="/"
                    edit={edit}
                    fetchFileTree={fetchFileTree}
                    handleSelectFile={props.handleSelectFile}
                /> : null
            }
        </List>
    );
}