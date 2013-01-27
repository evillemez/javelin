
    if (typeof module !== 'undefined') {
        // export for node
        module.exports = Javelin;
    } else {
        // assign to window
        this.Javelin = Javelin;
    }
}).apply(this);