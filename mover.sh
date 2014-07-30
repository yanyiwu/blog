target_dir="_site/read_by_url/"

if [ ! -x "$target_dir" ]; then
    mkdir "$target_dir"
fi
cp -rf read_by_url/* "$target_dir"
