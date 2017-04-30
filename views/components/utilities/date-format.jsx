import React from 'react';

class DateFormat extends React.Component {

    constructor(props){
        super(props);

        let dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        let monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
        let timestamp = new Date(this.props.date * 1000);

        if(timestamp == 'Invalid Date'){
            timestamp = new Date(this.props.date);
        }

        this.state={
            dayNames: dayNames,
            monthNames: monthNames,
            timestamp: timestamp
        };

        this.getFormattedDate = this.getFormattedDate.bind(this);
    }

    getFormattedDate(date){
        let dayNames = this.state.dayNames;
        let monthNames = this.state.monthNames;

        let dayOfWeek = date.getDay();
        let day = date.getDate();
        let month = date.getMonth();
        let year = date.getFullYear();
        let hour = date.getHours();
        let min = date.getMinutes();

        let myDate = `${monthNames[month]} ${day}, ${year}`;
        if(this.props.weekday){
            myDate = `${dayNames[dayOfWeek]} ${monthNames[month]} ${day}, ${year}`;
        }else if(this.props.time){
            myDate = `${monthNames[month]} ${day}, ${year} - ${hour}:${min}`;
        }else if(this.props.weekday && this.props.time){
            myDate = `${dayNames[dayOfWeek]} ${monthNames[month]} ${day}, ${year} - ${hour}:${min}`;
        }

        return (
            <span className="date">
                {myDate}
            </span>
        );
    }
    render(){
        let date = this.state.timestamp;
        // console.log("my date", date);
        return(
            this.getFormattedDate(date)
        );
    }


}
export default DateFormat;
