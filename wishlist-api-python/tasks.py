from invoke import task


@task
def clean(c):
    patterns = ["build", "**/*.pyc"]

    for pattern in patterns:
        c.run("rm -rf {}".format(pattern))


@task
def run(c):
    c.run("python3 src/local.py")


@task
def package(c):
    clean(c)

    c.run("mkdir -p build/src build/dist")
    c.run("cp -R src/* build/src/")
    c.run("pip install -r requirements.txt -t build/src")
    c.run('find build/src -name "*.pyc" -exec rm {} \\;')
    c.run("pushd build/src; zip -r9 ../dist/lambda.zip .; popd")


@task
def format(c):
    c.run("black *.py src/ tests/")
