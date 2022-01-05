import { Component } from 'react';

import { Box, AppBar, Toolbar, IconButton, Typography, InputBase, alpha,
        ThemeProvider, createTheme, styled } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';

import UserMenu from '../UserMenu';
import LoginMenu from '../LoginMenu';

import './index.css';

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
      width: 'auto',
    },
  }));
  
  const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }));
  
  const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
      padding: theme.spacing(1, 1, 1, 0),
      // vertical padding + font size from searchIcon
      paddingLeft: `calc(1em + ${theme.spacing(4)})`,
      transition: theme.transitions.create('width'),
      width: '100%',
      [theme.breakpoints.up('md')]: {
        width: '20ch',
      },
    },
  }));
  

class Header extends Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            username: ""
        };
    }

    componentDidMount() {
        this.checkUserStatus();
    }

    checkUserStatus = () => {
        fetch("/auth/user", { method: "GET" })
            .then(res => res.json())
            .then(res => {
                this.setState({ username: res.username });
            })
            .catch(err => err);
    }

    darkTheme = createTheme({
        typography: {
            fontFamily: 'Helvatica'
        },
        palette: {
            mode: 'dark',
            primary: {
                main: '#1976d2',
            },
        },
    });

    renderMenu = () => {
        if (this.state.username) {
            return (<UserMenu username={this.state.username}/>)
        } else {
            return (<LoginMenu/>)
        }
    }

    render() {
        return (
            <div>
                <Box>
                    <ThemeProvider theme={this.darkTheme}>
                        <AppBar position="static">
                            <Toolbar>
                                <IconButton size="large" edge="start" sx={{ mr: 2 }} onClick={this.props.toggleShowFileBrower}>
                                    <MenuIcon/>
                                </IconButton>
                                <Typography variant="h6"> MiniC-Playground </Typography>
                                <Search>
                                    <SearchIconWrapper>
                                        <SearchIcon/>
                                    </SearchIconWrapper>
                                <StyledInputBase placeholder="Search…"/>
                                </Search>
                                <Box sx={{ flexGrow: 1 }} />
                                {this.renderMenu()}
                            </Toolbar>
                        </AppBar>
                    </ThemeProvider>
                </Box>
            </div>
        );
    }
}

export default Header;