# fuxy

Proxy to bypass MITM proxies.

## How does it work?

Let's define some concepts first:

* **client**: the computer trying to access the internet (normally your computer)
* **fuxy**: fuxy as a hole (both client and server)
* **fuxy-client**: client side part from fuxy
* **fuxy-server**: server side part from fuxy
* **server**: server away from proxies's network
* **proxy**: proxy used to access the internet

Usually:

**client** -> **proxy** -> **INTERNET**

With **fuxy**:

**client** -> **fuxy-client** -> **proxy** -> **fuxy-server** -> **INTERNET**

This architecture allows **fuxy-client** to establish a protocol and encrypts its communication with **fuxy-server** this communication will be intercepted by **proxy** but the real communication will be maintained decoded by **fuxy-server**.


### The protocol

We decided to use a REST API on top of HTTP since it is usually not blocked by any proxy. This may slow things down but we try to improve on that later.

#### `POST /socket`

##### Request

```
{
    id
    host
    port
    data
}
```

##### Response

```
{
    id
    data
}
```

And that's it.


