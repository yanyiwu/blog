all:
	LANG="en_US.UTF-8"; LC_ALL="en_US.UTF-8"; jekyll build -d ./_alpha_site
release:
	LANG="en_US.UTF-8"; LC_ALL="en_US.UTF-8"; jekyll build -d ./_site
