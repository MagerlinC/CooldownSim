import React, { Component } from 'react';
import './App.scss';
import {cds} from './cds.json';
import TimestampInput from "./TimestampInput";
import Menu from '../src/assets/menu-button.svg';
import Settings from '../src/assets/settings.svg';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            slack: localStorage.getItem('slack') ? Number(localStorage.getItem('slack')) : 0,
            inputTimeStamps: this.getLocalStorageTimestamps(),
            inputCDs: [{name: 'Aura Mastery', person: "Paladin", cooldown: 180}],
            newTimestampInputLabelValue: '',
            newTimestampInputTimeValue: '',
            newCooldownNameInputValue: '',
            newCooldownInputValue: '',
            newCooldownPersonInputValue: '',
            simulationSolution: [],
            optionsExpanded: false,
            menuExpanded: false,
        };
    }

    getLocalStorageTimestamps() {
        let timestamps = JSON.parse(localStorage.getItem('timestamps'));
        if(!timestamps) {
            localStorage.setItem('timestamps', JSON.stringify([{id: 'AA00', label: 'Example Timestamp', time: 60}]));
            return [{label: 'Example Timestamp', time: 60}];
        }
        return timestamps;
    }

    handleTimestampTimeInputChange(e, index) {
        let newVal = e.target.value;
        let id = this.state.inputTimeStamps[index].id;
        let ts = JSON.parse(localStorage.getItem('timestamps'));
        ts.forEach(t => {
            if(t.id === id) {
                t.time = newVal;
            }
        });
        ts.sort(this.sortAsNumber);
        localStorage.setItem('timestamps', JSON.stringify(ts));
        this.setState(prevState => {
            let timeStamps = prevState.inputTimeStamps.slice();
            timeStamps[index].time = newVal;
            return {inputTimeStamps: timeStamps}
        });
    }

    sortOnBlur() {
        this.setState(prevState => {
            let timeStamps = prevState.inputTimeStamps.slice();
            timeStamps.sort(this.sortAsNumber);
            return {inputTimeStamps: timeStamps}
        });
    }

    handleTimestampLabelInputChange(e, index) {
        let newVal = e.target.value;
        let id = this.state.inputTimeStamps[index].id;
        let ts = JSON.parse(localStorage.getItem('timestamps'));
        ts.forEach(t => {
            if(t.id === id) {
                t.label = newVal;
            }
        });
        ts.sort(this.sortAsNumber);
        localStorage.setItem('timestamps', JSON.stringify(ts));

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
        return parseInt('' + a.time) > parseInt('' + b.time);
    }

    guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    handleAddNewTimestamp() {
        this.state.inputTimeStamps.sort(this.sortAsNumber);
        let labelVal = this.state.newTimestampInputLabelValue ? this.state.newTimestampInputLabelValue : ('L' + (this.state.inputTimeStamps.length+1))
        let timeVal = this.state.newTimestampInputTimeValue.includes(':') ?
            this.toSeconds(this.state.newTimestampInputTimeValue) : this.state.newTimestampInputTimeValue;
        let id = this.guid();

        if(timeVal) {
            let ts = JSON.parse(localStorage.getItem('timestamps'));
            ts.push({id: id, label: labelVal, time: timeVal});
            ts.sort(this.sortAsNumber);
            localStorage.setItem('timestamps', JSON.stringify(ts));
            this.setState(prevState => {
                let timeStamps = prevState.inputTimeStamps.slice();
                timeStamps.push({id: id, label: labelVal, time: timeVal});
                timeStamps.sort(this.sortAsNumber);
                return {inputTimeStamps: timeStamps, newTimestampInputTimeValue: '', newTimestampInputLabelValue: ''}
            });
        }
        this.newTimestampLabelInputRef.focus();
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

    getAppropriateNameForCd(cdName) {
        let person = 'UNKNOWN';
        cds.list.forEach(cd => {
            if(cd.name === cdName) {
                person = cd.class;
            }
        });
        return person;
    }

    handleAddNewCDInput() {
        if(this.state.newCooldownInputValue && this.state.newCooldownNameInputValue) {
            let person = this.state.newCooldownPersonInputValue ? this.state.newCooldownPersonInputValue : this.getAppropriateNameForCd(this.state.newCooldownNameInputValue);
            this.setState(prevState => {
                let cds = prevState.inputCDs.slice();
                cds.push({name: this.state.newCooldownNameInputValue, person: person, cooldown: this.state.newCooldownInputValue});
                return {inputCDs: cds, newCooldownPersonInputValue: '', newCooldownNameInputValue: '', newCooldownInputValue: ''}
            });
        }
    }

    handleAutocomplete(name, cooldown) {
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
        return timeSince;
    }


    handleDeleteTimestamp(id) {
        let ts = JSON.parse(localStorage.getItem('timestamps'));
        let index = -1;
        ts.forEach((t, i) => {
            if(t.id === id) {
                index = i;
            }
        });
        ts.splice(index, 1);
        if(ts.length === 0 ){
            localStorage.removeItem('timestamps');
        }
        else localStorage.setItem('timestamps', JSON.stringify(ts));
        this.setState(prevState => {
            let timestamps = prevState.inputTimeStamps.slice();
            let index = -1;
            timestamps.forEach((timestamp, i) => {
                if(timestamp.id === id) {
                    index = i;
                }
            });
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

    getMaxPossibleCDUsesInTotalTime(cd, totalTime) {
        //No decimals
        let fraction = totalTime/(cd.cooldown - this.state.slack);
        if (fraction > 0) {
            return Math.floor(fraction);

        } else return 99;
    }

    getNooneCanMultiUse(cds) {
        let nooneCanMultiUse = true;
        cds.forEach(cd => {
            if(cd.maxUses > cd.uses + 1) {
                nooneCanMultiUse = false;
            }
        });
        return nooneCanMultiUse;
    }

    simulateBestSetup() {
        let timeStamps = this.state.inputTimeStamps.slice();
        let cds = this.state.inputCDs.slice();

        let slack = Number(this.state.slack);

        let numCds = cds.length;
        let numTimestamps = timeStamps.length;
        let numCDsUsedForMultiUsage = 0;
        let totalTime = timeStamps[numTimestamps-1].time;

        const sortByCooldown = (a,b) => {
            return a.cooldown < b.cooldown;
        };
        cds.sort(sortByCooldown);
        cds.forEach(cd => {
            cd.maxUses = this.getMaxPossibleCDUsesInTotalTime(cd, totalTime);
            cd.uses = 0;
        });

        let solution = [];

        for(let i = 0; i < timeStamps.length; i++) {
            let cd = null;
            if(numCds === 1 && ((this.getTimeSinceLastUse(cds[0], timeStamps[i], solution) + slack) >= cds[0].cooldown)) {
                console.log('Adding cd ', cds[0]);
                cd = cds[0];
            }
            for(let j = 0; j < cds.length && cd === null; j++) {
                // We still need more CDs than there are
                if(numCds + numCDsUsedForMultiUsage < numTimestamps) {
                    let timeSince = this.getTimeSinceLastUse(cds[j], timeStamps[i].time, solution);
                    // CD is ready and still has multiple uses left
                    if(cds[j].maxUses >= cds[j].uses + 1 && (timeSince + slack >= cds[j].cooldown)) {
                        cd = cds[j];
                        numCDsUsedForMultiUsage++;
                        if(!(timeSince >= cds[j].cooldown)) {
                            cd.slackUsed = (cds[j].cooldown - timeSince);
                        }
                    }
                }
                else {
                    //time since last use of CD is smaller than the CD's cooldown
                    let timeSince = this.getTimeSinceLastUse(cds[j], timeStamps[i].time, solution);
                    if(timeSince + slack >= cds[j].cooldown) {
                        cd = cds[j];
                        if(timeSince < cds[j].cooldown) {
                            console.log('Register slack');
                            cd.slackUsed = (cds[j].cooldown - timeSince);
                        }
                    }

                }
            }
            if(cd) {
                cd.uses = (cd.uses ? cd.uses + 1 : 1);
                solution.push({name: cd.name, person: cd.person, cooldown: cd.cooldown, timestamp: timeStamps[i], slackUsed: cd.slackUsed});
            }
            // No CDs for multi use was found, so we try single use
            else {
                for(let k = 0; k < cds.length && cd === null; k++) {
                    let timeSince = this.getTimeSinceLastUse(cds[k], timeStamps[i].time, solution);
                    if(cds[k].maxUses > cds[k].uses && (timeSince + slack >= cds[k].cooldown)) {
                        cd = cds[k];
                        if(timeSince < cds[k].cooldown) {
                            console.log('Register slack');
                            cd.slackUsed = (cds[k].cooldown - timeSince);
                        }

                    }
                }
                if(cd) {
                    cd.uses = (cd.uses ? cd.uses + 1 : 1);
                    solution.push({name: cd.name, person: cd.person, cooldown: cd.cooldown, timestamp: timeStamps[i], slackUsed: cd.slackUsed});
                } else solution.push({name: 'N/A', person: 'N/A', cooldown: 0, timestamp: timeStamps[i]});
            }

        }
        this.setState({simulationSolution: solution});
    }

    handleGotRef(ref) {
        this.newTimestampLabelInputRef = ref;
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
        return parseInt(''+mins) * 60 + parseInt(''+secs);
    }

    toggleOptions() {
        this.setState(prevState => {
            return {optionsExpanded: !prevState.optionsExpanded, menuExpanded: false};
        });
    }

    toggleMenu() {
        this.setState(prevState => {
            return {menuExpanded: !prevState.menuExpanded, optionsExpanded: false};
        });
    }

    handleSlackInputChange(e) {
        if(Number(e.target.value)) {
            localStorage.setItem('slack', Number(e.target.value));
            this.setState({slack: Number(e.target.value)});
        }
        else {
            localStorage.setItem('slack', 0);
            this.setState({slack: 0});
        }
    }

    render() {
        return (
            <div className="App">
                <div className="app-header">
                    <img src={Menu} className="burger-menu" onClick={() => this.toggleMenu()} />
                    {
                        this.state.menuExpanded ?
                            <div className="menu-list">
                                <p className="slack-input-header">Nothing yet, sorry!</p>
                            </div>
                            : null
                    }
                    <h1 className="app-header-title">Optimal Healer CD Simulator</h1>
                    <img src={Settings} onClick={() => this.toggleOptions()} className="settings-menu"/>
                    {
                        this.state.optionsExpanded ?
                            <div className="options-list">
                                <p className="slack-input-header">Slack</p>
                                <input value={this.state.slack} placeholder="slack" className="slack-input" onChange={e => this.handleSlackInputChange(e)}/>
                                <p className="tooltip">Control the accuracy of your timestamps</p>
                            </div>
                            : null
                    }
                </div>
                <div className="tables-container">
                    <div className="timestamps-section">
                        <p className="app-description">Input timestamps for the fight below</p>

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
                                    Time (seconds after start)
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
                                            <TimestampInput value={timeStamp.label} id={timeStamp.id} onDelete={(id) => this.handleDeleteTimestamp(id)} onChange={e =>  this.handleTimestampLabelInputChange(e, index)}/>
                                        </td>
                                        <td>
                                            <TimestampInput onBlur={() => this.sortOnBlur()} id={timeStamp.id} value={timeStamp.time} onDelete={(name) => this.handleDeleteTimestamp(name)} onChange={e =>  this.handleTimestampTimeInputChange(e, index)}/>
                                        </td>
                                    </tr>
                                ))
                            }
                            </tbody>
                        </table>
                        <div className="input-section-timestamp">
                            <div className="double-input">
                                <TimestampInput placeholder={"Input new timestamp label (optional)"} value={this.state.newTimestampInputLabelValue} onKeyPress={() => this.handleAddNewTimestamp()} onChange={e => this.handleNewInputLabelChange(e)}/>
                                <TimestampInput refFunction={ref => this.handleGotRef(ref)} placeholder={"Input new timestamp time"} value={this.state.newTimestampInputTimeValue} onKeyPress={() => this.handleAddNewTimestamp()} onChange={e => this.handleNewInputTimeChange(e)}/>
                                <p className="tooltip">Timestamps can be input as minutes:seconds or seconds</p>
                            </div>
                            <button className="add-button" onClick={() => this.handleAddNewTimestamp()}>Add Timestamp</button>
                        </div>
                    </div>
                    <div className="cds-section">
                        <p className="app-description">Input available CDs on your team below</p>

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
                        <div className="input-section-cooldowns">
                            <div className="double-input">
                                <TimestampInput showSuggestions={true} onAdd={(name, cooldown) => this.handleAutocomplete(name, cooldown)} placeholder={"Input new CD Name"} value={this.state.newCooldownNameInputValue} onKeyPress={() => this.handleAddNewCDInput()} onChange={e => this.handleNewCDNameInputChange(e)}/>
                                <TimestampInput placeholder={"Input new CD Cooldown"}  value={this.state.newCooldownInputValue} onKeyPress={() => this.handleAddNewCDInput()} onChange={e => this.handleNewCDInputChange(e)}/>
                                <TimestampInput placeholder={"Input new CD Player (optional)"}  value={this.state.newCooldownPersonInputValue} onKeyPress={() => this.handleAddNewCDInput()} onChange={e => this.handleNewCDPersonInputChange(e)}/>
                            </div>
                            <button className="add-button" onClick={() => this.handleAddNewCDInput()}>Add Cooldown</button>
                        </div>
                    </div>
                </div>
                <button className="simulate-button" onClick={() => this.simulateBestSetup()}>Simulate</button>
                {
                    this.state.simulationSolution.length > 0 ?
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
                                        <td className="solution-td">{this.toMinutes(elem.timestamp.time) + (elem.slackUsed ? ' (+'  + elem.slackUsed + ')' : '')}</td>
                                    </tr>
                                ))
                            }
                            </tbody>
                        </table>
                        : null
                }
            </div>
        );
    }
}


export default App;
