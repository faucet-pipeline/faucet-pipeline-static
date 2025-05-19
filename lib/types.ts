import { AssetManager } from "faucet-pipeline-core/lib/types.ts"

export interface Config {
	source: string,
	target: string,
	targetDir: string,
	fingerprint?: boolean,
	compact?: CompactorMap,
	assetManager: AssetManager,
	filter?: Filter
}

export interface CompactorMap {
	[fileExtension: string]: Compactor
}

export interface Compactor {
	(contact: Buffer): Promise<Buffer>
}

export interface ProcessFile {
	(filename: string, opts: ProcessFileOptions): Promise<unknown>
}

export interface ProcessFileOptions {
	source: string,
	target: string,
	targetDir: string,
	assetManager: AssetManager,
}

export interface FileFinderOptions {
	skipDotfiles: boolean,
	filter?: Filter
}

export interface Filter {
	(filename: string): boolean
}
