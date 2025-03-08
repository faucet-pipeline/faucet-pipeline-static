// faucet-pipeline-core types
export interface FaucetPlugin<T> {
		(config: T[], assetManager: AssetManager, options: FaucetPluginOptions): FaucetPluginFunc
}

export interface FaucetPluginFunc {
		(filepaths: string[]): Promise<unknown>
}

export interface FaucetPluginOptions {
		browsers?: string[],
		sourcemaps?: boolean,
		compact?: boolean
}

export interface AssetManager {
		resolvePath: (path: string, opts?: ResolvePathOpts) => string
		writeFile: (targetPath: string, content: Buffer, options: WriteFileOpts) => Promise<unknown>
}

export interface ResolvePathOpts {
		enforceRelative?: boolean
}

export interface WriteFileOpts {
		targetDir: string,
		fingerprint?: boolean
}

// faucet-pipeline-static types
export interface Config {
		source: string,
		target: string,
		targetDir: string,
		fingerprint?: boolean,
		compact?: CompactorMap,
		assetManager: AssetManager,
		filter?: (fileName: string) => boolean
}

export interface CompactorMap {
		[fileExtension: string]: Compactor
}

export interface Compactor {
		(contact: Buffer): Promise<Buffer>
}

export interface ProcessFile {
		source: string,
		target: string,
		targetDir: string,
		fingerprint?: boolean,
		compactors: CompactorMap,
		assetManager: AssetManager,
}

export interface FileFinderOptions {
		skipDotfiles?: boolean,
		filter?: (filename: string) => boolean
}
