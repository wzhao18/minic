import { Component } from 'react';

import Header from '../../components/Header'
import CompileService from '../../components/CompileService'
import FileBrowser from '../../components/FileBrowser'

import './index.css';

class Home extends Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            showFileBrower: false,
            selectFilePath: "",
            code: null,
            fileTree: null
        };
    }

    toggleShowFileBrower = () => {
        this.setState({ showFileBrower: !this.state.showFileBrower, selectFilePath: ""})
    }

    setCode = (value: string) => {
        this.setState({ code: value })
    }

    handleSelectFile = (path: string) => {
        fetch(`/code/fs${path}`,
            {
                method: "GET",
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(res => res.text())
            .then(res => this.setState({ selectFilePath: path, code: res }))
            .catch(err => err);
    }

    fetchFileTree = () => {
        fetch("/code",
            {
                method: "GET",
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(res => res.json())
            .then(res => {
                this.setState({ fileTree: res })
            })
            .catch(err => err);
    }

    renderFileBrower = () => {
        if (this.state.showFileBrower) {
            return (
                <div style={{ float: "left", width: '20%'}}>
                    <FileBrowser
                        handleSelectFile={this.handleSelectFile}
                        fetchFileTree={this.fetchFileTree}
                        fileTree={this.state.fileTree}
                    />
                </div>
            )
        }
    }

    render() {
        return (
            <div>
                <Header toggleShowFileBrower={this.toggleShowFileBrower}/>
                {this.renderFileBrower()}
                <div style={{ width: this.state.showFileBrower ? "80%" : "100%", float: "left"}}>
                    <CompileService
                        selectFilePath={this.state.selectFilePath}
                        code={this.state.code}
                        setCode={this.setCode}
                        fetchFileTree={this.fetchFileTree}
                    />
                </div>
            </div>
        );
    }
}

export default Home;