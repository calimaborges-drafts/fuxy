import { infoFromString, hostFromUrl, portFromUrl } from '../src/shared/http-parsing';

test('it should extract basic http info from header', () => {
    const data = "POST / HTTP/1.1";

    const httpInfo = infoFromString(data);
    expect(httpInfo.method).toBe('POST');
    expect(httpInfo.uri).toBe('/');
    expect(httpInfo.version).toBe('HTTP/1.1');
});

test('it should extract host from URL', () => {
    const url = "http://the.host:8080/teste";
    const host = hostFromUrl(url);
    expect(host).toBe("the.host");
});

test('it should extract port from URL', () => {
    const url = "http://the.host:8080/teste";
    const host = portFromUrl(url);
    expect(host).toBe("8080");
});

test('it should extract port from https URL', () => {
    const url = "https://the.host/teste";
    const host = portFromUrl(url);
    expect(host).toBe("443");
});

test('it should extract port from http URL', () => {
    const url = "http://the.host/teste";
    const host = portFromUrl(url);
    expect(host).toBe("80");
});