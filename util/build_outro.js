
    if (typeof module !== 'undefined') {
        // export for node
        module.exports = Javelin.getInstance();
    } else {
        // assign to window
        this.javelin = new Javelin();
    }
}).apply(this);
