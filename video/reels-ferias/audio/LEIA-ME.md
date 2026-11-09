# Narração · "Se você tirar férias"

- Voz sintética: Kokoro TTS (modelo v1.0, licença Apache 2.0), voz `pm_alex`, português do Brasil.
- `falas.txt`: início (s) | velocidade | texto de cada fala.
- `gerar_narracao.py`: gera um WAV por fala (requer `kokoro-onnx`, `kokoro-v1.0.onnx` e `voices-v1.0.bin`, baixados do GitHub do projeto kokoro-onnx).
- A fala do CTA usa fonemas manuais para pronunciar "comercial" e "direct" do jeito brasileiro: `ˌeɪŋvˈiy kˌomeɾsiˈaʊ nʊ dˈaɪɾɛktʃ.`
- Mixagem: falas posicionadas com `adelay`, compressão leve e normalização para -14 LUFS (pico -1,5 dBTP). Arquivo final: `narracao.wav`.
