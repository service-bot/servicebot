function dateFormatter(cell, row) {
    let date = new Date(cell);
    console.log("date", cell, date);
    return `${('0' + date.getDate()).slice(-2)}/${('0' + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()}`;
}

export  dateFormatter;