workflow "On new changes" {
  on = "push"
  resolves = ["Deploy to GitHub Pages"]
}

action "Filter master branch" {
  uses = "actions/bin/filter@24a566c2524e05ebedadef0a285f72dc9b631411"
  args = "branch master"
}

action "Install deps" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = ["Filter master branch"]
  args = "install"
}

action "Build assets" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = ["Install deps"]
  args = "run build"
}

action "Deploy to GitHub Pages" {
  uses = "maxheld83/ghpages@v0.2.1"
  needs = ["Build assets"]
  env = {
    BUILD_DIR = "dist/"
  }
  secrets = ["GH_PAT"]
}
