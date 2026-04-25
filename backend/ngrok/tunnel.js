import { connect } from "ngrok";

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    const url = await connect({
      addr: PORT,
      authtoken: process.env.NGROK_AUTHTOKEN,
    });

    console.log(`✅ Ngrok ativo: ${url}`);
  } catch (err) {
    console.error("Erro ao iniciar ngrok:", err);
  }
})();