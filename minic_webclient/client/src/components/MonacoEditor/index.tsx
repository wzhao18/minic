import { Component } from 'react';
import Editor from '@monaco-editor/react';

class MonacoEditor extends Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = {
            language: "c",
            theme: "vs-dark",
        }
    }

    options = {
        "quickSuggestions": true,
        "validate": false,
        "readOnly": false,
        "fontSize": "20px"
    }

    render() {
        return (
            <Editor
                language={this.props.language || this.state.language}
                value={this.props.code}
                theme={this.props.theme || this.state.theme}
                options={{...this.options, ...this.props.options}}
                onChange={this.props.handleEditorChange}
            />
        );
    }
}

export default MonacoEditor