/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { RangedToken } from '../../rangedToken.js';
import { Word } from '../../simpleCodec/tokens/index.js';
import { assert } from '../../../../../base/common/assert.js';
import { Range } from '../../../../../editor/common/core/range.js';
import { URI } from '../../../../../base/common/uri.js';

// Start sequence for a file reference token in a prompt.
const TOKEN_START: string = '#file:';

/**
 * A file reference token inside a prompt.
 */
export class FileReference extends RangedToken {
	// Start sequence for a file reference token in a prompt.
	public static readonly TOKEN_START = TOKEN_START;

	constructor(
		range: Range,
		public readonly path: string,
	) {
		super(range);
	}

	/**
	 * Get full text of the file reference token.
	 */
	get text(): string {
		return `${TOKEN_START}${this.path}`;
	}

	/**
	 * The `URI` of the file reference.
	 */
	get uri(): URI {
		return URI.file(this.path);
	}

	/**
	 * Create a file reference token out of a generic `Word`.
	 *
	 * Throws! if the word does not conform to the expected format or
	 * if the reference is an invalid `URI`.
	 */
	public static fromWord(word: Word): FileReference {
		const { text } = word;

		assert(
			text.startsWith(TOKEN_START),
			`The reference must start with "${TOKEN_START}", got ${text}.`,
		);

		const maybeReference = text.split(TOKEN_START);

		assert(
			maybeReference.length === 2,
			`The expected reference format is "${TOKEN_START}:filesystem-path", got ${text}.`,
		);

		const [first, second] = maybeReference;

		assert(
			first === '',
			`The reference must start with "${TOKEN_START}", got ${first}.`,
		);

		assert(
			// Note! this accounts for both cases when second is `undefined` or `empty`
			// 		 and we don't care about rest of the "falsy" cases here
			!!second,
			`The reference path must be defined, got ${second}.`,
		);

		const reference = new FileReference(
			word.range,
			second,
		);

		return reference;
	}

	/**
	 * Check if this token is equal to another one.
	 */
	public equals(other: FileReference): boolean {
		if (!super.sameRange(other.range)) {
			return false;
		}

		return this.text === other.text;
	}

	/**
	 * Return a string representation of the token.
	 */
	public override toString(): string {
		return `file-ref("${this.text}")${this.range}`;
	}
}
