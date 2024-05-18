
export const postRequest = async (url, body) => {
    const token = localStorage.getItem("token");
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body
    })

    const data = await response.json()

    return data;
};

export const getRequest = async (url)=> {
    const token = localStorage.getItem("token");
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
    });

    const data = await response.json()
    if (!response.ok) {
        let message;

        if (data?.message) {
            message = data.message
        }
        else {
            message = data;
        }
        return { error: true, message }
    }

    return data;
};