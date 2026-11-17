import {Config} from '@remotion/cli/config';
// Chromium headless já instalado no ambiente (sem download).
Config.setBrowserExecutable('/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setConcurrency(4);
Config.setOverwriteOutput(true);
