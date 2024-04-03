import React from 'react';
import './camping-dates-manager.css';

export default class CampingDatesManager extends React.Component {
    days = ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"];
    months = ["Jan", "Feb", "March", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
    utcToPdtMinutesAdjustment = 420;
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            items: []
        };
    }

    componentDidMount() {
        fetch("/api/camping-dates")
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        items: result.items
                    });
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            )
    }

    deleteSubscription(id) {
        fetch(`/api/camping-dates/${id}`, {method: "DELETE"}).then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        items: result.items
                    });
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            )
    }

    addSubscription(e) {
        // Prevent the browser from reloading the page
        e.preventDefault();
        const startDate = new Date(e.target[1].value);
        const endDate = new Date(e.target[2].value);
        if (endDate.getMonth() !== startDate.getMonth() || endDate.getFullYear() !== startDate.getFullYear()) {
            alert("Dates should be in the same month and year");
        }
        const datesDistance = endDate.getDate() - startDate.getDate();
        const dates = [`${startDate.toISOString().split('T')[0]}`];
        for (let i = 1; i < datesDistance; i++) {
            startDate.setDate(startDate.getDate() + 1);
            dates.push(`${startDate.toISOString().split('T')[0]}`);
        }

        // You can pass formData as a fetch body directly:
        fetch('/api/camping-dates', {
            headers: {
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
                subscription: {
                    campId: parseInt(e.target[0].value),
                    dates: dates
                }
            })
        })
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        items: result.items
                    });
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            );
    }

    render() {
        const {error, isLoaded, items} = this.state;
        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            return (
                <div>
                    <ul>
                        {items.sort((item1, item2) => item1.name.localeCompare(item2.name)).map((item) => (
                            <li key={item.id}>
                                {item.name}: {item.dates.reduce((str, date, index) => {
                                if (index === 0) {
                                    const bookedDate = new Date(date);
                                    bookedDate.setMinutes(bookedDate.getMinutes() + this.utcToPdtMinutesAdjustment);
                                    return `${this.days[bookedDate.getDay()]}(${this.months[bookedDate.getMonth()]} ${bookedDate.getDate()})`;
                                }
                                if (index === (item.dates.length - 1)) {
                                    const bookedDate = new Date(date);
                                    bookedDate.setMinutes(bookedDate.getMinutes() + this.utcToPdtMinutesAdjustment);
                                    bookedDate.setDate(bookedDate.getDate() + 1);
                                    return str + " - " + `${this.days[bookedDate.getDay()]}(${this.months[bookedDate.getMonth()]} ${bookedDate.getDate()})`;
                                }
                                return str;
                            }, "")}
                                <button onClick={this.deleteSubscription.bind(this, item.id)}
                                        className="delete-icon">
                                    X
                                </button>
                            </li>
                        ))}
                    </ul>
                    <br/>
                    <div>
                        <form method="post" onSubmit={this.addSubscription.bind(this)}>
                            <label htmlFor="camping">Camp:</label>
                            <select name="camping" id="camping">
                                <option value="232449">North Pines</option>
                                <option value="232447">Upper Pines</option>
                                <option value="232768">Tahoe</option>
                            </select>
                            <label htmlFor="startDate">Check-in date:</label>
                            <input id="startDate" type="date"/>
                            <label htmlFor="endDate">Check-out date:</label>
                            <input id="endDate" type="date"/>
                            <button type="submit">add subscription</button>
                        </form>
                    </div>
                </div>
            );
        }
    }
}