import { GitService } from '../gitService';
import * as path from 'path';

async function test() {
    const root = path.resolve(__dirname, '../../');
    console.log(`Testing GitService in: ${root}`);

    const service = new GitService(root);

    try {
        console.log('Fetching history for package.json...');
        const commits = await service.getHistory('package.json');
        console.log(`Found ${commits.length} commits.`);

        if (commits.length > 0) {
            console.log('Latest commit:', commits[0]);

            console.log('Fetching content for latest commit...');
            const content = await service.getFileContent(commits[0].hash, 'package.json');
            console.log('Content length:', content.length);
            console.log('Content snippet:', content.substring(0, 50).replace(/\n/g, ' '));
        } else {
            console.log('No commits found. Make sure to commit files first.');
        }

    } catch (err) {
        console.error('Verification Failed:', err);
    }
}

test();
