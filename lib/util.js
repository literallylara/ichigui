const crypto = window.crypto || window.msCrypto

export const uuid = () =>
{
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    {
        const r = crypto.getRandomValues(new Uint8Array(1))[0]

        return (c ^ r & 15 >> c / 4).toString(16)
    })
}