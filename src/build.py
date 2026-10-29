"""Build the installable app into dist/ from the shared app source (house.html)."""
import re, sys, time, json, pathlib, shutil
here = pathlib.Path(__file__).parent
src = pathlib.Path(sys.argv[1]).read_text()
out = here / "dist"; out.mkdir(exist_ok=True)
libs = re.findall(r'<script src="(https://[^"]+)"', src) + re.findall(r'<link rel="stylesheet" href="(https://fonts[^"]+)"', src)
(out / "index.html").write_text((here / "shell-head.html").read_text() + src + "\n</body>\n</html>\n")
(out / "sw.js").write_text((here / "sw.js").read_text().replace("__BUILD__", time.strftime("%Y%m%d%H%M")).replace("__LIBS__", json.dumps(libs)))
for f in ["manifest.webmanifest", "icon-192.png", "icon-512.png"]: shutil.copy(here / f, out / f)
print("built", out, len(libs), "libs")
