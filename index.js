class Promise {
    constructor (executor) {
        this.promiseState = 'pending'
        this.promiseResult = null
        this.callbacks = []
        const self = this
        function res (data) {
            // console.log(data)
            if (self.promiseState !== 'pending') return
            self.promiseState = 'fulfilled'
            self.promiseResult = data
            self.callbacks.forEach(x => x.onResolved(data))
        }
        function rej (reason) {
            // console.log(reason)
            if (self.promiseState !== 'pending') return
            self.promiseState = 'rejected'
            self.promiseResult = reason
            self.callbacks.forEach(x => x.onRejected(reason))
        }
        executor(res, rej)
    }
    then (onResolved, onRejected) {
        return new Promise((res, rej) => {
            if (this.promiseState === 'fulfilled') {
                const fn = () => {
                    const result = onResolved(this.promiseResult)
                    if (result instanceof Promise) {
                        result.then(data => {
                            res(data)
                        }, reason => {
                            rej(reason)
                        })
                    } else {
                        res(result)
                    }
                }
                queueMicrotask(fn)
            }
            if (this.promiseState === 'rejected') {
                const fn = () => {
                    const result = onRejected(this.promiseResult)
                    if (result instanceof Promise) {
                        result.then(data => {
                            res(data)
                        }, reason => {
                            rej(reason)
                        })
                    } else {
                        res(result)
                    }
                }
                queueMicrotask(fn)
            }
            if (this.promiseState === 'pending') {
                this.callbacks.push({ onResolved, onRejected })
            }
        })
    }
    catch (onRejected) {
        return this.then(null, onRejected)
    }
}
