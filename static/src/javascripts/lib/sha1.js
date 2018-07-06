// @flow

/* eslint no-bitwise: 0, no-plusplus: 0, default-case: 0 */

/**
 * SHA-1 hash function reference implementation.
 *
 * @namespace
 */
const Sha1 = {
    /**
     * Generates SHA-1 hash of string.
     *
     * @param   {string} msg - (Unicode) string to be hashed.
     * @returns {string} Hash of msg as hex character string.
     */
    hash(content: string) {
        let msg = content;

        // convert string to UTF-8, as SHA only deals with byte-streams
        msg = decodeURIComponent(encodeURIComponent(msg));

        // constants [§4.2.1]
        const K = [0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6];

        // PREPROCESSING

        msg += String.fromCharCode(0x80); // add trailing '1' bit (+ 0's padding) to string [§5.1.1]

        // convert string msg into 512-bit/16-integer blocks arrays of ints [§5.2.1]
        const l = msg.length / 4 + 2; // length (in 32-bit integers) of msg + ‘1’ + appended length
        const N = Math.ceil(l / 16); // number of 16-integer-blocks required to hold 'l' ints
        const M = new Array(N);

        for (let i = 0; i < N; i++) {
            M[i] = new Array(16);
            for (let j = 0; j < 16; j++) {
                // encode 4 chars per integer, big-endian encoding
                M[i][j] =
                    (msg.charCodeAt(i * 64 + j * 4) << 24) |
                    (msg.charCodeAt(i * 64 + j * 4 + 1) << 16) |
                    (msg.charCodeAt(i * 64 + j * 4 + 2) << 8) |
                    msg.charCodeAt(i * 64 + j * 4 + 3);
            } // note running off the end of msg is ok 'cos bitwise ops on NaN return 0
        }
        // add length (in bits) into final pair of 32-bit integers (big-endian) [§5.1.1]
        // note: most significant word would be (len-1)*8 >>> 32, but since JS converts
        // bitwise-op args to 32 bits, we need to simulate this by arithmetic operators
        M[N - 1][14] = ((msg.length - 1) * 8) / 2 ** 32;
        M[N - 1][14] = Math.floor(M[N - 1][14]);
        M[N - 1][15] = ((msg.length - 1) * 8) & 0xffffffff;

        // set initial hash value [§5.3.1]
        let H0 = 0x67452301;
        let H1 = 0xefcdab89;
        let H2 = 0x98badcfe;
        let H3 = 0x10325476;
        let H4 = 0xc3d2e1f0;

        // HASH COMPUTATION [§6.1.2]

        const W = new Array(80);
        let a;
        let b;
        let c;
        let d;
        let e;

        for (let i = 0; i < N; i++) {
            // 1 - prepare message schedule 'W'
            for (let t = 0; t < 16; t++) {
                W[t] = M[i][t];
            }
            for (let t = 16; t < 80; t++) {
                W[t] = Sha1.ROTL(
                    W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16],
                    1
                );
            }

            // 2 - initialise five working variables a, b, c, d, e with previous hash value
            a = H0;
            b = H1;
            c = H2;
            d = H3;
            e = H4;

            // 3 - main loop
            for (let t = 0; t < 80; t++) {
                const s = Math.floor(t / 20); // seq for blocks of 'f' functions and 'K' constants
                const T =
                    (Sha1.ROTL(a, 5) + Sha1.f(s, b, c, d) + e + K[s] + W[t]) &
                    0xffffffff;
                e = d;
                d = c;
                c = Sha1.ROTL(b, 30);
                b = a;
                a = T;
            }

            // 4 - compute the new intermediate hash value (note 'addition modulo 2^32')
            H0 = (H0 + a) & 0xffffffff;
            H1 = (H1 + b) & 0xffffffff;
            H2 = (H2 + c) & 0xffffffff;
            H3 = (H3 + d) & 0xffffffff;
            H4 = (H4 + e) & 0xffffffff;
        }

        return (
            Sha1.toHexStr(H0) +
            Sha1.toHexStr(H1) +
            Sha1.toHexStr(H2) +
            Sha1.toHexStr(H3) +
            Sha1.toHexStr(H4)
        );
    },

    /**
     * Function 'f' [§4.1.1].
     * @private
     */
    f(s: number, x: number, y: number, z: number) {
        switch (s) {
            case 0:
                return (x & y) ^ (~x & z); // Ch()
            case 1:
                return x ^ y ^ z; // Parity()
            case 2:
                return (x & y) ^ (x & z) ^ (y & z); // Maj()
            case 3:
                return x ^ y ^ z; // Parity()
        }
    },

    /**
     * Rotates left (circular left shift) value x by n positions [§3.2.5].
     * @private
     */
    ROTL(x: number, n: number) {
        return (x << n) | (x >>> (32 - n));
    },

    /**
     * Hexadecimal representation of a number.
     * @private
     */
    toHexStr(n: number) {
        // note can't use toString(16) as it is implementation-dependant,
        // and in IE returns signed numbers when used on full words
        let s = '';
        let v;

        for (let i = 7; i >= 0; i--) {
            v = (n >>> (i * 4)) & 0xf;
            s += v.toString(16);
        }

        return s;
    },
};

export default Sha1;
