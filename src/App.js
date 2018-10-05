import React, { Component } from 'react';
import './App.scss';
import TimestampInput from "./TimestampInput";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            inputTimeStamps: [{label: 'ex1', time: 60}, {label: 'ex2', time: 120}, {label: 'ex3', time: 180}],
            inputCDs: [{name: 'Aura Mastery', person: "Light", cooldown: 60}, {name: 'Tranquility', person: "Acey", cooldown: 120}],
            newTimestampInputLabelValue: '',
            newTimestampInputTimeValue: '',
            newCooldownNameInputValue: '',
            newCooldownInputValue: '',
            newCooldownPersonInputValue: '',
            simulationSolution: [],
        }
    }

    handleTimestampTimeInputChange(e, index) {
        let newVal = e.target.value;

        this.setState(prevState => {
            let timeStamps = prevState.inputTimeStamps.slice();
            timeStamps[index].time = newVal;
            return {inputTimeStamps: timeStamps}
        });
    }

    handleTimestampLabelInputChange(e, index) {
        let newVal = e.target.value;

        this.setState(prevState => {
            let timeStamps = prevState.inputTimeStamps.slice();
            timeStamps[index].label = newVal;
            return {inputTimeStamps: timeStamps}
        });
    }

    handleNewInputLabelChange(e) {
        this.setState({newTimestampInputLabelValue: e.target.value});
    }


    handleNewInputTimeChange(e) {
        this.setState({newTimestampInputTimeValue: e.target.value});
    }

    sortAsNumber(a,b) {
        return Number(a.time) > Number(b.time);
    }


    handleAddNewTimestamp() {
        this.state.inputTimeStamps.sort(this.sortAsNumber);

        if(this.state.newTimestampInputLabelValue && this.state.newTimestampInputTimeValue) {
            if(this.state.newTimestampInputLabelValue.includes(':')) {
                this.setState(prevState => {
                    let timeStamps = prevState.inputTimeStamps.slice();
                    timeStamps.push(this.toSeconds(this.state.newTimestampInputValue));
                    timeStamps.sort(this.sortAsNumber);
                    return {inputTimeStamps: timeStamps, newTimestampInputValue: ''}
                });
            }
            else {
                this.setState(prevState => {
                    let timeStamps = prevState.inputTimeStamps.slice();
                    timeStamps.push({label: this.state.newTimestampInputLabelValue, time: this.state.newTimestampInputTimeValue});
                    timeStamps.sort(this.sortAsNumber);
                    return {inputTimeStamps: timeStamps, newTimestampInputLabelValue: '', newTimestampInputTimeValue: ''}
                });
            }
        }


    }

    handleCDNameInputChange(e, index) {
        let newVal = e.target.value;
        this.setState(prevState => {
            let cds = prevState.inputCDs.slice();
            cds[index].name = newVal;
            return {inputCDs: cds}
        });
    }
    handleCDInputChange(e, index) {
        let newVal = e.target.value;
        this.setState(prevState => {
            let cds = prevState.inputCDs.slice();
            cds[index].cooldown = newVal;
            return {inputCDs: cds}
        });
    }

    handleCDPersonInputChange(e, index) {
        let newVal = e.target.value;
        this.setState(prevState => {
            let cds = prevState.inputCDs.slice();
            cds[index].person = newVal;
            return {inputCDs: cds}
        });
    }

    handleNewCDPersonInputChange(e, index) {
        this.setState({newCooldownPersonInputValue: e.target.value});

    }

    handleNewCDNameInputChange(e) {
        this.setState({newCooldownNameInputValue: e.target.value});
    }

    handleNewCDInputChange(e) {
        this.setState({newCooldownInputValue: e.target.value});
    }

    handleAddNewCDInput() {
        if(this.state.newCooldownInputValue && this.state.newCooldownNameInputValue && this.state.newCooldownPersonInputValue) {
            this.setState(prevState => {
                let cds = prevState.inputCDs.slice();
                cds.push({name: this.state.newCooldownNameInputValue, person: this.state.newCooldownPersonInputValue, cooldown: this.state.newCooldownInputValue});
                return {inputCDs: cds, newCooldownPersonInputValue: '', newCooldownNameInputValue: '', newCooldownInputValue: ''}
            });
        }
    }

    handleAutocomplete(name, cooldown) {
        console.log('Adding ', name, cooldown);
        this.setState({
            newCooldownNameInputValue: name, newCooldownInputValue: cooldown
        });
    }

    getTimeSinceLastUse(cd, curTime, solutionList) {
        //If not used, we set time since to max, so it will always be higher than CD
        let timeSince = 9999999;
        solutionList.forEach(cdUsed => {
            if(cdUsed.name !=='N/A' && cdUsed.person !== 'N/A' && cdUsed.name === cd.name && cdUsed.person === cd.person) {
                timeSince = curTime - cdUsed.timestamp.time;
            }
        });
        console.log('Time since ', cd.name, ' was used by ', cd.person, ' was', timeSince);
        return timeSince;
    }


    handleDeleteTimestamp(index) {
        this.setState(prevState => {
            let timestamps = prevState.inputTimeStamps.slice();
            timestamps.splice(index, 1);
            return {inputTimeStamps: timestamps};
        });
    }

    handleDeleteCD(index) {
        this.setState(prevState => {
            let cds = prevState.inputCDs.slice();
            cds.splice(index, 1);
            return {inputCDs: cds};
        });
    }

    simulateBestSetup() {
        const sortByCooldown = (a,b) => {
            return a.cooldown < b.cooldown;
        };
        let cds = this.state.inputCDs.slice();
        cds.sort(sortByCooldown);
        let timeStamps = this.state.inputTimeStamps.slice();
        let solution = [];
        for(let i = 0; i < timeStamps.length; i++) {
            if(i === 0) {
                // Starting from the biggest CD
                solution.push({name: cds[0].name, person: cds[0].person, cooldown: cds[0].cooldown, timestamp: timeStamps[i]});
            }
            else {
                let cd = null;
                for(let j = 0; j < cds.length && cd === null; j++) {
                    //time since last use of CD is smaller than the CD's cooldown
                    let timeSince = this.getTimeSinceLastUse(cds[j], timeStamps[i].time, solution);
                    if(timeSince >= cds[j].cooldown) {
                        cd = cds[j];
                    }

                }
                if(cd) {
                    solution.push({name: cd.name, person: cd.person, cooldown: cd.cooldown, timestamp: timeStamps[i]});
                }
                else solution.push({name: 'N/A', person: 'N/A', cooldown: 0, timestamp: timeStamps[i]});
            }
        }
        this.setState({simulationSolution: solution});
    }

    toMinutes(secs) {
        let minutes = Math.floor(secs / 60);
        let seconds = secs - minutes * 60;
        return minutes + ':' + (seconds < 10  ? '0' + seconds : seconds);

    }

    toSeconds(minutes) {
        let timeUnits = minutes.split(':');
        let mins = timeUnits[0];
        let secs = timeUnits[1];
        return Number(mins) * 60 + Number(secs);
    }

    render() {
        return (
            <div className="App">
                <div className="app-header">
                    <h1 className="app-header-title">Optimal Healer CD Simulator</h1>
                </div>
                <p className="app-description">Input timestamps and available CDs below</p>
                <div className="tables-container">
                    <div className="timestamps-section">
                        <table className="timestamps-table">
                            <thead>
                            <tr>
                                <th className='table-header'>
                                    Timestamp
                                </th>
                                <th className='table-header'>
                                    Label
                                </th>
                                <th className='table-header'>
                                    Time (Sec)
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                this.state.inputTimeStamps.map((timeStamp, index) => (
                                    <tr key={'input-'+index} className="input-timestamps">
                                        <td>
                                            {'T'+(index+1)}
                                        </td>
                                        <td>
                                            <TimestampInput value={timeStamp.label} onDelete={() => this.handleDeleteTimestamp(index)} onChange={e =>  this.handleTimestampLabelInputChange(e, index)}/>
                                        </td>
                                        <td>
                                            <TimestampInput value={timeStamp.time} onDelete={() => this.handleDeleteTimestamp(index)} onChange={e =>  this.handleTimestampTimeInputChange(e, index)}/>
                                        </td>
                                    </tr>
                                ))
                            }
                            </tbody>
                        </table>

                    </div>
                    <div className="cds-section">
                        <table className="cds-table">
                            <thead>
                            <tr>
                                <th className='table-header'>
                                    Player
                                </th>
                                <th className='table-header'>
                                    Ability
                                </th>
                                <th className='table-header'>
                                    Cooldown (Sec)
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                this.state.inputCDs.map((cd, index) => (
                                    <tr key={'cds-'+index}>
                                        <td>
                                            <TimestampInput value={cd.person} onDelete={() => this.handleDeleteCD(index)} onChange={e =>  this.handleCDPersonInputChange(e, index)}/>
                                        </td>
                                        <td>
                                            <TimestampInput value={cd.name} onDelete={() => this.handleDeleteCD(index)} onChange={e =>  this.handleCDNameInputChange(e, index)}/>
                                        </td>
                                        <td>
                                            <TimestampInput value={cd.cooldown} onDelete={() => this.handleDeleteCD(index)}  onChange={e =>  this.handleCDInputChange(e, index)}/>
                                        </td>
                                    </tr>
                                ))
                            }

                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="inputs-section">
                    <div className="input-section-timestamp">
                        <div className="double-input">
                            <TimestampInput placeholder={"Input new timestamp label"} value={this.state.newTimestampInputLabelValue} onKeyPress={() => this.handleAddNewTimestamp()} onChange={e => this.handleNewInputLabelChange(e)}/>
                            <TimestampInput placeholder={"Input new timestamp time"} value={this.state.newTimestampInputTimeValue} onKeyPress={() => this.handleAddNewTimestamp()} onChange={e => this.handleNewInputTimeChange(e)}/>
                            <div className="placeholder"/>
                        </div>
                        <button className="add-button" onClick={() => this.handleAddNewTimestamp()}>Add Timestamp</button>
                    </div>
                    <div className="input-section-cooldowns">
                        <div className="double-input">
                            <TimestampInput showSuggestions={true} onAdd={(name, cooldown) => this.handleAutocomplete(name, cooldown)} placeholder={"Input new CD Name"} value={this.state.newCooldownNameInputValue} onKeyPress={() => this.handleAddNewCDInput()} onChange={e => this.handleNewCDNameInputChange(e)}/>
                            <TimestampInput placeholder={"Input new CD Cooldown"}  value={this.state.newCooldownInputValue} onKeyPress={() => this.handleAddNewCDInput()} onChange={e => this.handleNewCDInputChange(e)}/>
                            <TimestampInput placeholder={"Input new CD Player"}  value={this.state.newCooldownPersonInputValue} onKeyPress={() => this.handleAddNewCDInput()} onChange={e => this.handleNewCDPersonInputChange(e)}/>
                        </div>
                        <button className="add-button" onClick={() => this.handleAddNewCDInput()}>Add Cooldown</button>
                    </div>

                </div>
                <button className="simulate-button" onClick={() => this.simulateBestSetup()}>Simulate</button>

                <table className="solution-table">
                    <thead className="solution-table-head">
                    <tr>
                        <th>Ability Name</th>
                        <th>Player Name</th>
                        <th>Ability CD</th>
                        <th>Timestamp Label</th>
                        <th>Timestamp</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.state.simulationSolution.map((elem, index) => (
                            <tr key={elem.name + '-' + index} className="solution-row">
                                <td className="solution-td">{elem.name}</td>
                                <td className="solution-td">{elem.person}</td>
                                <td className="solution-td">{elem.cooldown}</td>
                                <td className="solution-td">{elem.timestamp.label}</td>
                                <td className="solution-td">{this.toMinutes(elem.timestamp.time)}</td>
                            </tr>
                        ))
                    }
                    </tbody>
                </table>

            </div>
        );
    }
}


export default App;
