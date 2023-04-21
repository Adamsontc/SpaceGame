# Git Basics

## `git config`

* Personal values are stored in the `~/.gitconfig` or `~/.config/git/config’ files.  When you use the `--global` option, this is where those values are kept.  These are global values for all repositories
* Without the `--global` option, values are stored in the local directory (i.e. in the repository) in a file `.git/config`.  This is where you would store repository specific configuration parameters.

Each level overrides values from the previous level.

You can view all of your settings AND where they are coming from using the command `git config --list --show-origin`

## Identify Yourself

`git config --global user.name “John Doe”`

`git config --global user.email “johndoe@example.com”`
 
## Getting Help

`git help <verb>` or `git <verb> --help` will give you information about using the <verb> command with git.  For example, `git help config` or `git config --help` will provide all the ways that you can use the `config` command with git.

The command `git <verb> -h` will give a more concise help page rather than everything about that command.

## Creating And Initializing A Repository

1. Create a directory that you want to be your repository.  This is where your project files will live.
2. Inside the directory run the command `git init`.  This sets up the directory to be managed by git.  (In reality this command creates the directory .git.  Inside that subdirectory is where git keeps all of its information about your directory.  So you could run this command on an existing directory that already has files in it.  Just keep in mind that nothing within the directory is being version-controlled yet.  You have to tell git to track files.  Any file that you tell git to track, it will then monitor that file to see if it changes.

If someone has already set up a repository on the web and you want to get a copy of that repository on your computer then you run the command `git clone <url>` where `<url>` is the URL of the website for the online repository.  This command will copy the online repository to your local computer, creating a folder that is already initialized.  One thing to note about cloning from GitHub, you will need to setup a personal access token.  Read the information [here](https://docs.github.com/en/get-started/getting-started-with-git/about-remote-repositories#cloning-with-https-urls).

## Begin And Stop Tracking Files

## Stage And Commit Changes

## Ignoring Files

## Undo Mistakes

## Browse Project History, View Changes Between Commits

## Push and Pull From Remote Repositories
