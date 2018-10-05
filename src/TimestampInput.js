import React, { Component } from 'react';
import deleteX from '../src/assets/clear-button.svg';
import {cds} from './cds.json';
import './App.scss';

class TimestampInput extends Component {
    constructor(props) {
        super(props);
        this.state = {
            suggestions: [],
            showSuggestions: this.props.showSuggestions,
        };
    }

    handleKeyPress(e) {
        if(e.key === 'Enter') {
            if(this.props.onKeyPress) {
                this.props.onKeyPress(e);
            }
            else return;
        }
    }

    getAutoCompletions(string) {
        let names = [];
        cds.list.forEach(cd => {
            if(cd.name.toLowerCase().includes(string.toLowerCase())) {
                names.push(cd.name);
            }
        });
        return names;
    }

    addSuggestions(suggestions) {
        if(suggestions.length > 0 && suggestions.length < 3) {
            this.setState(prevState => {
                let prevSuggestions = prevState.suggestions.slice();
                prevSuggestions.push(...suggestions);
                return {suggestions: prevSuggestions};
            });
        }
    }

    handleAcceptSuggestion(index) {
        let cooldown = null;
        cds.list.forEach(cd => {
            if(cd.name === this.state.suggestions[index]) {
                cooldown = cd.cooldown;
            }
        });
        this.props.onAdd(this.state.suggestions[index], cooldown);
        this.setState({suggestions: []});
    }

    handleChange(e) {
        if(this.props.showSuggestions) {
            this.setState({suggestions: [], showSuggestions: true});
            let suggestions = this.getAutoCompletions(e.target.value);
            if(suggestions) {
                this.addSuggestions(suggestions);
            }
        }
        this.props.onChange(e);
    }



    render() {
        return (
            <div className="timestamp-input">
                <input ref={(input) => this.props.refFunction ? this.props.refFunction(input): null} placeholder={this.props.placeholder}
                       onBlur={() => this.props.onBlur ? this.props.onBlur() : null}
                       value={this.props.value} onKeyDown={e => this.handleKeyPress(e)} onChange={e => this.handleChange(e)}/>
                {
                    this.props.onDelete ? <img className="delete-x" src={deleteX} onClick={() => this.props.onDelete(this.props.id)}/> : null
                }
                {
                    this.props.showSuggestions && this.state.suggestions.length > 0 ?
                        <div className="suggestion-list">
                            {
                                this.state.suggestions.map((suggestion, index) => (
                                    <div key={index} onClick={() => this.handleAcceptSuggestion(index)} className="suggestion-item">{suggestion}</div>
                                ))
                            }
                        </div> : null
                }

            </div>
        );
    }
}


export default TimestampInput;
