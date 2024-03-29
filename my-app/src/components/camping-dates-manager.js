import React from 'react';
import './camping-dates-manager.css';

export default class CampingDatesManager extends React.Component {
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

        // Read the form data
        const form = e.target;
        const formData = new FormData(form);

        // You can pass formData as a fetch body directly:
        fetch('/api/camping-dates', {
            headers: {
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
                subscription: {
                    campId: parseInt(e.target[0].value),
                    dates: JSON.parse(e.target[1].value)
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
        const days = ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"];
        const months = ["Jan", "Feb", "March", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
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
                                {item.name}: {item.dates.map(date => {
                                const bookedDate = new Date(Date.parse(date));
                                return `${days[bookedDate.getDay()]}(${months[bookedDate.getMonth()]} ${bookedDate.getDate()})`;
                            }).join(" - ")}
                                <button onClick={this.deleteSubscription.bind(this, item.id)}
                                        className="delete-icon">
                                    X
                                </button>
                            </li>
                        ))}
                    </ul>
                    <div>
                        <form method="post" onSubmit={this.addSubscription.bind(this)}>
                            <select name="camping" id="camping">
                                <option value="232449">North Pines</option>
                                <option value="232447">Upper Pines</option>
                                <option value="232768">Tahoe</option>
                            </select>
                            <input id="datesRange"/>
                            <button type="submit">add subscription</button>
                        </form>
                    </div>
                </div>
            );
        }
    }
}