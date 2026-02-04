import * as cp from 'child_process';
import * as path from 'path';

export interface CommitInfo {
    hash: string;
    message: string;
    date: string;
}

export class GitService {
    constructor(private workspaceRoot: string) { }

    /**
     * Fetch the git log for a specific file.
     */
    async getHistory(filePath: string): Promise<CommitInfo[]> {
        return new Promise((resolve, reject) => {
            // Ensure we are running git from the workspace root
            // Log format: Hash | Message | Date
            const cmd = `git log --pretty=format:"%H|%s|%ad" --date=short -- "${filePath}"`;

            cp.exec(cmd, { cwd: this.workspaceRoot }, (err, stdout, stderr) => {
                if (err) {
                    // Start by rejecting, but user might not have git or not be in a repo
                    console.error('Git log error:', err);
                    reject(new Error("Failed to fetch git history. Ensure this is a git repository."));
                    return;
                }

                const output = stdout.toString().trim();
                if (!output) {
                    resolve([]);
                    return;
                }

                const commits = output.split('\n').map(line => {
                    const parts = line.split('|');
                    return {
                        hash: parts[0],
                        message: parts[1],
                        date: parts[2]
                    };
                });

                resolve(commits);
            });
        });
    }

    /**
     * Fetch content of a file at a specific commit.
     */
    async getFileContent(commitHash: string, relativePath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            // Convert to forward slashes for git command consistency
            const gitPath = relativePath.replace(/\\/g, '/');
            const cmd = `git show ${commitHash}:"${gitPath}"`;

            cp.exec(cmd, { cwd: this.workspaceRoot }, (err, stdout) => {
                if (err) {
                    reject(new Error(`Failed to fetch content for ${gitPath} at ${commitHash}`));
                    return;
                }
                resolve(stdout);
            });
        });
    }
}
