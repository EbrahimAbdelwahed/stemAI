GitHub MCP Server

Deprecation Notice: Development for this project has been moved to GitHub in the http://github.com/github/github-mcp-server repo.

MCP Server for the GitHub API, enabling file operations, repository management, search functionality, and more.
Features

    Automatic Branch Creation: When creating/updating files or pushing changes, branches are automatically created if they don't exist
    Comprehensive Error Handling: Clear error messages for common issues
    Git History Preservation: Operations maintain proper Git history without force pushing
    Batch Operations: Support for both single-file and multi-file operations
    Advanced Search: Support for searching code, issues/PRs, and users

Tools

    create_or_update_file
        Create or update a single file in a repository
        Inputs:
            owner (string): Repository owner (username or organization)
            repo (string): Repository name
            path (string): Path where to create/update the file
            content (string): Content of the file
            message (string): Commit message
            branch (string): Branch to create/update the file in
            sha (optional string): SHA of file being replaced (for updates)
        Returns: File content and commit details

    push_files
        Push multiple files in a single commit
        Inputs:
            owner (string): Repository owner
            repo (string): Repository name
            branch (string): Branch to push to
            files (array): Files to push, each with path and content
            message (string): Commit message
        Returns: Updated branch reference

    search_repositories
        Search for GitHub repositories
        Inputs:
            query (string): Search query
            page (optional number): Page number for pagination
            perPage (optional number): Results per page (max 100)
        Returns: Repository search results

    create_repository
        Create a new GitHub repository
        Inputs:
            name (string): Repository name
            description (optional string): Repository description
            private (optional boolean): Whether repo should be private
            autoInit (optional boolean): Initialize with README
        Returns: Created repository details

    get_file_contents
        Get contents of a file or directory
        Inputs:
            owner (string): Repository owner
            repo (string): Repository name
            path (string): Path to file/directory
            branch (optional string): Branch to get contents from
        Returns: File/directory contents

    create_issue
        Create a new issue
        Inputs:
            owner (string): Repository owner
            repo (string): Repository name
            title (string): Issue title
            body (optional string): Issue description
            assignees (optional string[]): Usernames to assign
            labels (optional string[]): Labels to add
            milestone (optional number): Milestone number
        Returns: Created issue details

    create_pull_request
        Create a new pull request
        Inputs:
            owner (string): Repository owner
            repo (string): Repository name
            title (string): PR title
            body (optional string): PR description
            head (string): Branch containing changes
            base (string): Branch to merge into
            draft (optional boolean): Create as draft PR
            maintainer_can_modify (optional boolean): Allow maintainer edits
        Returns: Created pull request details

    fork_repository
        Fork a repository
        Inputs:
            owner (string): Repository owner
            repo (string): Repository name
            organization (optional string): Organization to fork to
        Returns: Forked repository details

    create_branch
        Create a new branch
        Inputs:
            owner (string): Repository owner
            repo (string): Repository name
            branch (string): Name for new branch
            from_branch (optional string): Source branch (defaults to repo default)
        Returns: Created branch reference

    list_issues
        List and filter repository issues
        Inputs:
            owner (string): Repository owner
            repo (string): Repository name
            state (optional string): Filter by state ('open', 'closed', 'all')
            labels (optional string[]): Filter by labels
            sort (optional string): Sort by ('created', 'updated', 'comments')
            direction (optional string): Sort direction ('asc', 'desc')
            since (optional string): Filter by date (ISO 8601 timestamp)
            page (optional number): Page number
            per_page (optional number): Results per page
        Returns: Array of issue details

    update_issue
        Update an existing issue
        Inputs:
            owner (string): Repository owner
            repo (string): Repository name
            issue_number (number): Issue number to update
            title (optional string): New title
            body (optional string): New description
            state (optional string): New state ('open' or 'closed')
            labels (optional string[]): New labels
            assignees (optional string[]): New assignees
            milestone (optional number): New milestone number
        Returns: Updated issue details

    add_issue_comment
        Add a comment to an issue
        Inputs:
            owner (string): Repository owner
            repo (string): Repository name
            issue_number (number): Issue number to comment on
            body (string): Comment text
        Returns: Created comment details

    search_code
        Search for code across GitHub repositories
        Inputs:
            q (string): Search query using GitHub code search syntax
            sort (optional string): Sort field ('indexed' only)
            order (optional string): Sort order ('asc' or 'desc')
            per_page (optional number): Results per page (max 100)
            page (optional number): Page number
        Returns: Code search results with repository context

    search_issues
        Search for issues and pull requests
        Inputs:
            q (string): Search query using GitHub issues search syntax
            sort (optional string): Sort field (comments, reactions, created, etc.)
            order (optional string): Sort order ('asc' or 'desc')
            per_page (optional number): Results per page (max 100)
            page (optional number): Page number
        Returns: Issue and pull request search results

    search_users
        Search for GitHub users
        Inputs:
            q (string): Search query using GitHub users search syntax
            sort (optional string): Sort field (followers, repositories, joined)
            order (optional string): Sort order ('asc' or 'desc')
            per_page (optional number): Results per page (max 100)
            page (optional number): Page number
        Returns: User search results

    list_commits

    Gets commits of a branch in a repository
    Inputs:
        owner (string): Repository owner
        repo (string): Repository name
        page (optional string): page number
        per_page (optional string): number of record per page
        sha (optional string): branch name
    Returns: List of commits

    get_issue

    Gets the contents of an issue within a repository
    Inputs:
        owner (string): Repository owner
        repo (string): Repository name
        issue_number (number): Issue number to retrieve
    Returns: Github Issue object & details

    get_pull_request

    Get details of a specific pull request
    Inputs:
        owner (string): Repository owner
        repo (string): Repository name
        pull_number (number): Pull request number
    Returns: Pull request details including diff and review status

    list_pull_requests

    List and filter repository pull requests
    Inputs:
        owner (string): Repository owner
        repo (string): Repository name
        state (optional string): Filter by state ('open', 'closed', 'all')
        head (optional string): Filter by head user/org and branch
        base (optional string): Filter by base branch
        sort (optional string): Sort by ('created', 'updated', 'popularity', 'long-running')
        direction (optional string): Sort direction ('asc', 'desc')
        per_page (optional number): Results per page (max 100)
        page (optional number): Page number
    Returns: Array of pull request details

    create_pull_request_review

    Create a review on a pull request
    Inputs:
        owner (string): Repository owner
        repo (string): Repository name
        pull_number (number): Pull request number
        body (string): Review comment text
        event (string): Review action ('APPROVE', 'REQUEST_CHANGES', 'COMMENT')
        commit_id (optional string): SHA of commit to review
        comments (optional array): Line-specific comments, each with:
            path (string): File path
            position (number): Line position in diff
            body (string): Comment text
    Returns: Created review details

    merge_pull_request

    Merge a pull request
    Inputs:
        owner (string): Repository owner
        repo (string): Repository name
        pull_number (number): Pull request number
        commit_title (optional string): Title for merge commit
        commit_message (optional string): Extra detail for merge commit
        merge_method (optional string): Merge method ('merge', 'squash', 'rebase')
    Returns: Merge result details

    get_pull_request_files

    Get the list of files changed in a pull request
    Inputs:
        owner (string): Repository owner
        repo (string): Repository name
        pull_number (number): Pull request number
    Returns: Array of changed files with patch and status details

    get_pull_request_status

    Get the combined status of all status checks for a pull request
    Inputs:
        owner (string): Repository owner
        repo (string): Repository name
        pull_number (number): Pull request number
    Returns: Combined status check results and individual check details

    update_pull_request_branch

    Update a pull request branch with the latest changes from the base branch (equivalent to GitHub's "Update branch" button)
    Inputs:
        owner (string): Repository owner
        repo (string): Repository name
        pull_number (number): Pull request number
        expected_head_sha (optional string): The expected SHA of the pull request's HEAD ref
    Returns: Success message when branch is updated

    get_pull_request_comments

    Get the review comments on a pull request
    Inputs:
        owner (string): Repository owner
        repo (string): Repository name
        pull_number (number): Pull request number
    Returns: Array of pull request review comments with details like the comment text, author, and location in the diff

    get_pull_request_reviews

    Get the reviews on a pull request
    Inputs:
        owner (string): Repository owner
        repo (string): Repository name
        pull_number (number): Pull request number
    Returns: Array of pull request reviews with details like the review state (APPROVED, CHANGES_REQUESTED, etc.), reviewer, and review body

Search Query Syntax
Code Search

    language:javascript: Search by programming language
    repo:owner/name: Search in specific repository
    path:app/src: Search in specific path
    extension:js: Search by file extension
    Example: q: "import express" language:typescript path:src/

Issues Search

    is:issue or is:pr: Filter by type
    is:open or is:closed: Filter by state
    label:bug: Search by label
    author:username: Search by author
    Example: q: "memory leak" is:issue is:open label:bug

Users Search

    type:user or type:org: Filter by account type
    followers:>1000: Filter by followers
    location:London: Search by location
    Example: q: "fullstack developer" location:London followers:>100

For detailed search syntax, see GitHub's searching documentation.




-----------------------------------------------------------------------

PUPPETEER



A Model Context Protocol server that provides browser automation capabilities using Puppeteer. This server enables LLMs to interact with web pages, take screenshots, and execute JavaScript in a real browser environment.

Caution

This server can access local files and local/internal IP addresses since it runs a browser on your machine. Exercise caution when using this MCP server to ensure this does not expose any sensitive data.
Components
Tools

    puppeteer_navigate
        Navigate to any URL in the browser
        Inputs:
            url (string, required): URL to navigate to
            launchOptions (object, optional): PuppeteerJS LaunchOptions. Default null. If changed and not null, browser restarts. Example: { headless: true, args: ['--user-data-dir="C:/Data"'] }
            allowDangerous (boolean, optional): Allow dangerous LaunchOptions that reduce security. When false, dangerous args like --no-sandbox, --disable-web-security will throw errors. Default false.

    puppeteer_screenshot
        Capture screenshots of the entire page or specific elements
        Inputs:
            name (string, required): Name for the screenshot
            selector (string, optional): CSS selector for element to screenshot
            width (number, optional, default: 800): Screenshot width
            height (number, optional, default: 600): Screenshot height
            encoded (boolean, optional): If true, capture the screenshot as a base64-encoded data URI (as text) instead of binary image content. Default false.

    puppeteer_click
        Click elements on the page
        Input: selector (string): CSS selector for element to click

    puppeteer_hover
        Hover elements on the page
        Input: selector (string): CSS selector for element to hover

    puppeteer_fill
        Fill out input fields
        Inputs:
            selector (string): CSS selector for input field
            value (string): Value to fill

    puppeteer_select
        Select an element with SELECT tag
        Inputs:
            selector (string): CSS selector for element to select
            value (string): Value to select

    puppeteer_evaluate
        Execute JavaScript in the browser console
        Input: script (string): JavaScript code to execute

Resources

The server provides access to two types of resources:

    Console Logs (console://logs)
        Browser console output in text format
        Includes all console messages from the browser

    Screenshots (screenshot://<name>)
        PNG images of captured screenshots
        Accessible via the screenshot name specified during capture

Key Features

    Browser automation
    Console log monitoring
    Screenshot capabilities
    JavaScript execution
    Basic web interaction (navigation, clicking, form filling)
    Customizable Puppeteer launch options

Configuration to use Puppeteer Server
Usage with Claude Desktop

Here's the Claude Desktop configuration to use the Puppeter server:
Docker

NOTE The docker implementation will use headless chromium, where as the NPX version will open a browser window.

{
  "mcpServers": {
    "puppeteer": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "--init",
        "-e",
        "DOCKER_CONTAINER=true",
        "mcp/puppeteer"
      ]
    }
  }
}

NPX

{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
    }
  }
}

Usage with VS Code

For quick installation, use one of the one-click install buttons below...

Install with NPX in VS Code Install with NPX in VS Code Insiders

Install with Docker in VS Code Install with Docker in VS Code Insiders

For manual installation, add the following JSON block to your User Settings (JSON) file in VS Code. You can do this by pressing Ctrl + Shift + P and typing Preferences: Open User Settings (JSON).

Optionally, you can add it to a file called .vscode/mcp.json in your workspace. This will allow you to share the configuration with others.

    Note that the mcp key is not needed in the .vscode/mcp.json file.

For NPX installation (opens a browser window):

{
  "mcp": {
    "servers": {
      "puppeteer": {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
      }
    }
  }
}

For Docker installation (uses headless chromium):

{
  "mcp": {
    "servers": {
      "puppeteer": {
        "command": "docker",
        "args": [
          "run",
          "-i",
          "--rm",
          "--init",
          "-e",
          "DOCKER_CONTAINER=true",
          "mcp/puppeteer"
        ]
      }
    }
  }
}

Launch Options

You can customize Puppeteer's browser behavior in two ways:

    Environment Variable: Set PUPPETEER_LAUNCH_OPTIONS with a JSON-encoded string in the MCP configuration's env parameter:

    {
      "mcpServers": {
        "mcp-puppeteer": {
          "command": "npx",
          "args": ["-y", "@modelcontextprotocol/server-puppeteer"],
          "env": {
            "PUPPETEER_LAUNCH_OPTIONS": "{ \"headless\": false, \"executablePath\": \"C:/Program Files/Google/Chrome/Application/chrome.exe\", \"args\": [] }",
            "ALLOW_DANGEROUS": "true"
          }
        }
      }
    }

Tool Call Arguments: Pass launchOptions and allowDangerous parameters to the puppeteer_navigate tool:

{
  "url": "https://example.com",
  "launchOptions": {
    "headless": false,
    "defaultViewport": { "width": 1280, "height": 720 }
  }
}

