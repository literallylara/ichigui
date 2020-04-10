export default
{
    get: k =>
    {
        return JSON.parse(window.localStorage.getItem(k))
    },
    
    set: (k,v) =>
    {
        window.localStorage.setItem(k, JSON.stringify(v))
    }
}