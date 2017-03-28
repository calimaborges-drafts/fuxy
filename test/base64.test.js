import { encode, decode } from '../src/shared/base64';

test('should encode and decode base64', function() {
    const text = new Buffer('First text');
    const encoded = encode(text);
    const decoded = decode(text);

    expect(text.toString()).toBe(decoded.toString());
    expect(text.toString()).not.toBe(encoded.toString());
});