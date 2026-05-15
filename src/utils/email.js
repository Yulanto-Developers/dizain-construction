



export async function sendConsultationEmail(formData) {

  try {

    const response = await fetch(
      "/api/send-email",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(formData),
      }
    );

    return await response.json();

  } catch (error) {

    console.log(error);

    return {
      success: false,
    };
  }
}