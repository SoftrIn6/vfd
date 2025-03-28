async function register(userData) {
    const AIRTABLE_API_KEY = "patox1uzToHHuTN6C.43aeae3a53dcde9a2d77dca1208f249f701c441a8be695a57e20cd7e55160c72";  // Replace with your API Key
    const AIRTABLE_BASE_ID = "appkPRB6udnf0oyUb";  // Replace with your Base ID
    const AIRTABLE_TABLE_NAME = "Users"; // Replace with your actual table name

    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

    const headers = {
        "Authorization": `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json"
    };

    // Encrypt password before sending
    const hashedPassword = await hashPassword(userData.password);

    const body = JSON.stringify({
        records: [
            {
                fields: {
                    Username: userData.username,
                    Email: userData.email,
                    Password: hashedPassword, // Store hashed password
                    ReferralCode: userData.referred_by
                }
            }
        ]
    });

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: body
        });

        const result = await response.json();

        if (response.ok) {
            return { status: "success" };
        } else {
            return { status: "error", message: result.error?.message || "Error registering user. Please try again." };
        }
    } catch (error) {
        console.error("Registration Error:", error);
        return { status: "error", message: "Network error. Please try again later." };
    }
}

/**
 * Function to hash password using SHA-256
 */
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
}
